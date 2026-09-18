import {NextResponse} from 'next/server';
import {runAnalysis,autoRules} from '@/lib/engine';
import type {Rule} from '@/lib/types';
export async function POST(req:Request){try{const body=await req.json();const rows=Array.isArray(body.rows)?body.rows:[];if(!rows.length)return NextResponse.json({error:'No rows supplied'},{status:400});const rules=(Array.isArray(body.rules)?body.rules:[]) as Rule[];const analysis=runAnalysis(rows,rules);const suggested=autoRules(analysis.columns);return NextResponse.json({analysis,suggestedRules:suggested})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Analysis failed'},{status:500})}}
