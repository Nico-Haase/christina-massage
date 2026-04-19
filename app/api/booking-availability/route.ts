import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const date = searchParams.get("date");

    if (date) {
      const { data: bookings, error: bookingsError } = await supabaseAdmin
        .from("bookings")
        .select(
          "id, booking_date, booking_time, duration_minutes, service_name, status"
        )
        .eq("booking_date", date)
        .in("status", ["requested", "confirmed"])
        .order("booking_time", { ascending: true });

      if (bookingsError) {
        return NextResponse.json(
          { success: false, message: bookingsError.message },
          { status: 500 }
        );
      }

      const { data: blocks, error: blocksError } = await supabaseAdmin
        .from("blocked_times")
        .select("id, block_date, start_time, end_time, title, block_type, note")
        .eq("block_date", date)
        .order("start_time", { ascending: true });

      if (blocksError) {
        return NextResponse.json(
          { success: false, message: blocksError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bookings: bookings ?? [],
        blocks: blocks ?? [],
      });
    }

    if (!start || !end) {
      return NextResponse.json(
        { success: false, message: "Missing start/end or date." },
        { status: 400 }
      );
    }

    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("id, booking_date, booking_time, duration_minutes, status")
      .gte("booking_date", start)
      .lte("booking_date", end)
      .in("status", ["requested", "confirmed"]);

    if (bookingsError) {
      return NextResponse.json(
        { success: false, message: bookingsError.message },
        { status: 500 }
      );
    }

    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from("blocked_times")
      .select("id, block_date, start_time, end_time, title, block_type, note")
      .gte("block_date", start)
      .lte("block_date", end);

    if (blocksError) {
      return NextResponse.json(
        { success: false, message: blocksError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: bookings ?? [],
      blocks: blocks ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Serverfehler." },
      { status: 500 }
    );
  }
}