import sha256Shader from "./sha256Shader";

export default async (maxInputLenght: number) => {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw "NON_WEBGPU_NAVIGATOR"
  const device = await adapter.requestDevice();

  const gpuBufferFirstMatrix = device.createBuffer({
    size: maxInputLenght * Uint32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const gpuBufferSize = device.createBuffer({
    size: Int32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const resultMatrixBufferSize = Uint32Array.BYTES_PER_ELEMENT * 32;
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  const bindGroupLayout = (device).createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage"
        }
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage"
        }
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage"
        }
      }
    ]
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: gpuBufferFirstMatrix
        }
      },
      {
        binding: 1,
        resource: {
          buffer: gpuBufferSize
        }
      },
      {
        binding: 2,
        resource: {
          buffer: resultMatrixBuffer
        }
      }
    ]
  });

  const shaderModule = device.createShaderModule({
    code: sha256Shader,
  });

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
      module: shaderModule,
      entryPoint: "main"
    }
  });



  const hash = async (input: Uint32Array) => {
    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);

    passEncoder.dispatchWorkgroups(1, 1);
    passEncoder.end();

    const gpuReadBuffer = device.createBuffer({
      size: resultMatrixBufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    commandEncoder.copyBufferToBuffer(
      resultMatrixBuffer,
      0,
      gpuReadBuffer,
      0,
      resultMatrixBufferSize
    );

    device.queue.writeBuffer(gpuBufferFirstMatrix, 0, input, 0, input.length);
    device.queue.writeBuffer(gpuBufferSize, 0, new Uint32Array([input.length]), 0, 1);

    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);


    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = gpuReadBuffer.getMappedRange();

    let str = "";
    for (let value of Array.from(new Uint32Array(arrayBuffer))) {
      str += value.toString(16).padStart(2, '0');
    }
    return str;
  }

  const hashString = async (inputString: string) => {
    return await hash(Uint32Array.from((inputString.split("").map(e => e.charCodeAt(0)))))
  }

  const hashHex = async (inputHexString: string) => {
    const fromHexString = (hexString:string) =>
      Uint32Array.from(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

    return await hash(fromHexString(inputHexString))
  }

  return {
    hashString,
    hashHex,
  }
}