import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    )

    const { data, error } = await supabase
      .from('fruver_mir')
      .select('*')
      .order('anio', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Error fetching MIR:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error fetching MIR data',
      },
      { status: 500 }
    )
  }
}
