import * as si from "systeminformation";

export const metrics = async () => {
    const gpus = await si.graphics();
    const levels_gpu = gpus.controllers.map(controller => controller.utilizationGpu);
    const levels_mem = gpus.controllers.map(controller => controller.utilizationMemory);

    const cpuData = await si.currentLoad();
    const cpuUsage = cpuData.currentLoad;

    const memData = await si.mem();
    const memUsage = (memData.used / memData.total) * 100;

    const statusParts = [
        `$(zap)${cpuUsage.toFixed(1)}%`,
        `$(database)${memUsage.toFixed(1)}%`,
        `$(gpu-usage)${levels_gpu.join(",")}`,
        `$(gpu-memory)${levels_mem.join(",")}`,
    ];

    let levels_zipped = levels_gpu.map((val, index) => [val, levels_mem[index]]);

    const tooltipParts = [
        `CPU: ${cpuUsage.toFixed(1)}%`,
        `MEM: ${memUsage.toFixed(1)}%`,
        levels_zipped.map((val, index) =>
            `GPU${index}: gpu: ${val[0]}%, mem: ${val[1]}%`
        ).join("\n")
    ];

    const text = statusParts.join("");
    const tooltip = tooltipParts.join("\n");

    return { text, tooltip };
}

export default metrics;