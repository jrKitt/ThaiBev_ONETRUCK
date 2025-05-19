// src/app/api/route/route.ts

import { NextResponse } from 'next/server'

const ORS_API_KEY = process.env.ORS_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end   = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end query parameters' }, { status: 400 })
  }

  // เตรียม URL ไปยัง ORS
  const orsUrl = new URL('https://api.openrouteservice.org/v2/directions/driving-car')
  orsUrl.searchParams.set('start', start)
  orsUrl.searchParams.set('end', end)

  try {
    const orsRes = await fetch(orsUrl.toString(), {
      headers: { Authorization: ORS_API_KEY! }
    })
    if (!orsRes.ok) {
      const text = await orsRes.text()
      return NextResponse.json({ error: text }, { status: orsRes.status })
    }
    const json = await orsRes.json()
    // ส่งกลับเฉพาะ coordinates array
    const coords = json.features[0].geometry.coordinates
    return NextResponse.json(coords)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
