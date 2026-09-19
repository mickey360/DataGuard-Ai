export type Severity='low'|'medium'|'high'|'critical';
export type Rule={id:string;column:string;type:'not_null'|'unique'|'number_range'|'regex'|'allowed_values';config:Record<string,unknown>;enabled:boolean};
export type ColumnProfile={name:string;type:string;nullRate:number;uniqueRate:number;min?:number;max?:number;mean?:number;topValues:{value:string;count:number}[]};
export type QualityIssue={ruleId:string;column:string;severity:Severity;message:string;failed:number;total:number;evidence?:Record<string,unknown>};
export type Analysis={rowCount:number;columnCount:number;columns:ColumnProfile[];issues:QualityIssue[];score:number;runAt:string;schemaHash:string;volumeDelta?:number;summary:string};
export type Dataset={id:string;name:string;sourceType:string;createdAt:string;latest?:Analysis;runs:Analysis[];rules:Rule[]};
