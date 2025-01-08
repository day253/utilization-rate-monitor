import * as si from "systeminformation";

export const metrics = async () => {
    const cpuData = await si.currentLoad();
    const cpuUsage = cpuData.currentLoad;

    const memData = await si.mem();
    const memUsage = (memData.used / memData.total) * 100;

    const statusParts = [
        `$(zap)${cpuUsage.toFixed(1)}%`,
        `$(database)${memUsage.toFixed(1)}%`,
    ];

    const tooltipParts = [
        `CPU: ${cpuUsage.toFixed(1)}%`,
        `MEM: ${memUsage.toFixed(1)}%`,
    ];

    const gpus = await si.graphics();

    console.log(gpus);

    const levels_gpu = gpus.controllers.map(controller => controller.utilizationGpu);
    const levels_mem = gpus.controllers.map(controller => controller.utilizationMemory);
    
    // if (levels_gpu.length > 0) {
    //     statusParts.push(`$(gpu-usage)${levels_gpu.join(",")}`);
    //     let levels_zipped = levels_gpu.map((val, index) => [val, levels_mem[index]]);
    //     tooltipParts.push(levels_zipped.map((val, index) =>
    //         `GPU${index}: gpu: ${val[0]}%, mem: ${val[1]}%`
    //     ).join("\n"));
    // }

    // if (levels_mem.length > 0) {
    //     statusParts.push(`$(gpu-memory)${levels_mem.join(",")}`);
    // }

    const text = statusParts.join("");
    const tooltip = tooltipParts.join("\n");

    return { text, tooltip };
}

export default metrics;