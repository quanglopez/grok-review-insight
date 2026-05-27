CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own businesses" ON public.businesses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own businesses" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own businesses" ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own businesses" ON public.businesses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE,
  owner_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view reviews of own businesses" ON public.reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = reviews.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users insert reviews of own businesses" ON public.reviews FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = reviews.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users update reviews of own businesses" ON public.reviews FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = reviews.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users delete reviews of own businesses" ON public.reviews FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = reviews.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.analysis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  raw_result_json JSONB,
  average_rating NUMERIC(3,2),
  sentiment TEXT,
  top_strengths JSONB DEFAULT '[]',
  top_complaints JSONB DEFAULT '[]',
  topics JSONB DEFAULT '[]',
  keywords JSONB DEFAULT '[]',
  pain_points JSONB DEFAULT '[]',
  reply_templates JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_reports TO authenticated;
GRANT ALL ON public.analysis_reports TO service_role;

ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view reports of own businesses" ON public.analysis_reports FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = analysis_reports.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users insert reports of own businesses" ON public.analysis_reports FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = analysis_reports.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users delete reports of own businesses" ON public.analysis_reports FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = analysis_reports.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.analysis_reports(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  problem TEXT,
  evidence TEXT,
  action_steps JSONB DEFAULT '[]',
  priority TEXT,
  difficulty TEXT,
  expected_impact TEXT,
  kpi TEXT,
  timeline TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view recommendations of own businesses" ON public.recommendations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.analysis_reports r JOIN public.businesses b ON b.id = r.business_id WHERE r.id = recommendations.report_id AND b.user_id = auth.uid()));
CREATE POLICY "Users insert recommendations of own businesses" ON public.recommendations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.analysis_reports r JOIN public.businesses b ON b.id = r.business_id WHERE r.id = recommendations.report_id AND b.user_id = auth.uid()));
CREATE POLICY "Users delete recommendations of own businesses" ON public.recommendations FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.analysis_reports r JOIN public.businesses b ON b.id = r.business_id WHERE r.id = recommendations.report_id AND b.user_id = auth.uid()));