// Browser byte progress is not proof of provider transfer or draft persistence.
// Reserve completion for the successful server acknowledgement.
export function uploadProgress(event,previous=0){
 const loaded=Number(event?.loaded),total=Number(event?.total);
 if(!Number.isFinite(loaded)||!Number.isFinite(total)||loaded<0||total<=0)return previous;
 return Math.max(previous,Math.min(99,Math.floor(loaded/total*100)));
}
