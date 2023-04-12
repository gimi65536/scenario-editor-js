import { addSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import g003 from './scenario-schema/gimi65536.0.0.3.schema.json';

addSchema(g003);

export async function processObject2Scenario(obj){
	const success = await validate(g003.$id, obj);
	console.log(success);
}

export function emptyScenario(){
	//
}