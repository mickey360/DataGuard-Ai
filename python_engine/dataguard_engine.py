"""DataGuard AI reference data-quality engine.
Run: python dataguard_engine.py sample-data/customers.csv
This mirrors the concepts used by the web engine and is intended for heavier
batch jobs, scheduled pipelines, and future worker deployment.
"""
from __future__ import annotations
import csv, hashlib, json, sys
from collections import Counter

def profile(rows):
    cols=list(dict.fromkeys(k for r in rows for k in r))
    out=[]
    for c in cols:
        vals=[r.get(c,'') for r in rows]; non=[v for v in vals if str(v).strip()]
        nums=[]
        for v in non:
            try: nums.append(float(v))
            except ValueError: pass
        out.append({'name':c,'null_rate':1-len(non)/max(1,len(vals)),'unique_rate':len(set(non))/max(1,len(non)), 'min':min(nums) if nums else None,'max':max(nums) if nums else None,'top_values':Counter(non).most_common(5)})
    return out

def main(path):
    with open(path,newline='',encoding='utf-8') as f: rows=list(csv.DictReader(f))
    p=profile(rows); schema='|'.join(sorted(f"{x['name']}:{'number' if x['min'] is not None else 'string'}" for x in p)); h=hashlib.sha256(schema.encode()).hexdigest()[:12]
    print(json.dumps({'rows':len(rows),'columns':len(p),'schema_hash':h,'profile':p},indent=2))
if __name__=='__main__': main(sys.argv[1])
