/// <reference lib="webworker" />
// The worker receives only content already fetched through the username gate.
// It performs decompression, validation, and digest checking away from the UI.
import {decodeContentRelease} from "./content-release";
const worker=self as unknown as DedicatedWorkerGlobalScope;
worker.onmessage=async event=>{
 try{const content=await decodeContentRelease(event.data.manifest,event.data.pages,event.data.questionIds);worker.postMessage({content});}
 catch(error){worker.postMessage({error:error instanceof Error?error.message:"Study content could not be verified."});}
};
