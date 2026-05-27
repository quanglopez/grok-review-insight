import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const businessSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().max(255).optional().default(""),
  location: z.string().max(500).optional().default(""),
  google_maps_url: z.string().url().max(2000).optional().or(z.literal("")),
});

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => businessSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: data.name,
        category: data.category || null,
        location: data.location || null,
        google_maps_url: data.google_maps_url || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listBusinesses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("businesses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const reviewSchema = z.object({
  reviewer_name: z.string().max(255).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(10000).optional().nullable(),
  review_date: z.string().optional().nullable(),
  owner_reply: z.string().max(10000).optional().nullable(),
});

export const upsertReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        business_id: z.string().uuid(),
        reviews: z.array(reviewSchema).min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const rows = data.reviews.map((r) => ({
      business_id: data.business_id,
      reviewer_name: r.reviewer_name || null,
      rating: r.rating,
      review_text: r.review_text || null,
      review_date: r.review_date || null,
      owner_reply: r.owner_reply || null,
    }));
    const { error } = await supabase.from("reviews").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

export const listReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { business_id: string }) =>
    z.object({ business_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", data.business_id)
      .order("review_date", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return rows;
  });

export const clearReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { business_id: string }) =>
    z.object({ business_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("reviews").delete().eq("business_id", data.business_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });