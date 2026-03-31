import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VALID_CATEGORIES = [
  "electrician", "plumber", "carpenter", "painter", "general_handyman",
  "locksmith", "gardener", "cleaner", "mason", "roofer", "hvac", "other",
] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Auth
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("GUIDAL_API_KEY");
  if (!expectedKey) {
    console.error("[tradesmen] GUIDAL_API_KEY secret is not set");
    return jsonResponse({ error: "Service misconfigured" }, 503);
  }
  if (!apiKey || apiKey !== expectedKey) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // Parse query params
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const location = url.searchParams.get("location");
  const availableParam = url.searchParams.get("available");
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");

  // Validate category
  if (category && !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return jsonResponse(
      { error: "Invalid parameter", details: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
      400,
    );
  }

  // Validate available
  let available: boolean | null = null;
  if (availableParam !== null) {
    if (availableParam !== "true" && availableParam !== "false") {
      return jsonResponse(
        { error: "Invalid parameter", details: "available must be true or false" },
        400,
      );
    }
    available = availableParam === "true";
  }

  // Validate page
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) {
    return jsonResponse(
      { error: "Invalid parameter", details: "page must be an integer >= 1" },
      400,
    );
  }

  // Validate location length
  if (location && location.length > 100) {
    return jsonResponse(
      { error: "Invalid parameter", details: "location must be <= 100 characters" },
      400,
    );
  }

  // Validate limit
  const limit = limitParam ? parseInt(limitParam, 10) : 20;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return jsonResponse(
      { error: "Invalid parameter", details: "limit must be 1-100" },
      400,
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Build query with filters
    let countQuery = supabase
      .from("tradesmen_public")
      .select("*", { count: "exact", head: true });

    let dataQuery = supabase
      .from("tradesmen_public")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("avg_rating", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      countQuery = countQuery.eq("trade_category", category);
      dataQuery = dataQuery.eq("trade_category", category);
    }
    if (location) {
      countQuery = countQuery.ilike("location", `%${location}%`);
      dataQuery = dataQuery.ilike("location", `%${location}%`);
    }
    if (available !== null) {
      countQuery = countQuery.eq("is_available", available);
      dataQuery = dataQuery.eq("is_available", available);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) throw countResult.error;
    if (dataResult.error) throw dataResult.error;

    return jsonResponse({
      data: dataResult.data,
      pagination: {
        page,
        limit,
        total: countResult.count ?? 0,
      },
    });
  } catch (err) {
    console.error("[tradesmen] unhandled error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
