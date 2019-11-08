/*
 *  description: takes a single array, breaks it into chunks of size chunkSize
 *               and returns an array of arrays of max length chunkSize
 * 
 *  params: kvArray, chunkSize
 *  defaults: kvArray = [], chunkSize = 32
 *  return: [[], [], [], ...]
 */

export const chunkify = (kvArray: any, chunkSize: number = 32) => {
    if(kvArray.length === 0) {
        return [[]]
    } 
    
    if(kvArray.length <= chunkSize) {
        return [kvArray]
    }

    return kvArray.reduce((agg: any, curr: any, index: number) => {
        const chunkIndex = Math.floor(index / chunkSize)
        if(!agg[chunkIndex]) {
            agg[chunkIndex] = [] // create a new chunk
        }
        agg[chunkIndex].push(curr)
        return agg
    }, [])
}

export default chunkify