import { NextResponse } from 'next/server'

const F1_DASHBOARD_URL = 'http://localhost:3000'

export async function GET() {
  try {
    const response = await fetch(`${F1_DASHBOARD_URL}/api/data-requests`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch data requests')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching data requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data requests' },
      { status: 500 }
    )
  }
}
