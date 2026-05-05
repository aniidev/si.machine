export async function runPipeline(registry, context) {
  const { config, events, logger } = context;

  const input = registry.create("input", config.input.type, context, config.input.options);
  const processor = registry.create("processing", config.processing.type, context, config.processing.options);
  const ai = registry.create("ai", config.ai.type, context, config.ai.options);
  const output = registry.create("output", config.output.type, context, config.output.options);

  logger.info("Capturing input", { type: config.input.type });
  const captured = await input.capture();
  events.emit("pipeline:capture", captured);

  logger.info("Processing input", { type: config.processing.type });
  const processed = await processor.process(captured);
  const runtimePrompt = context.runtime?.prompt?.trim();
  if (runtimePrompt) {
    processed.text = [processed.text, `User instruction: ${runtimePrompt}`].filter(Boolean).join("\n\n");
    processed.metadata = {
      ...processed.metadata,
      runtimePrompt
    };
  }
  events.emit("pipeline:process", processed);

  logger.info("Calling AI provider", { type: config.ai.type });
  const result = await ai.complete(processed);
  events.emit("pipeline:ai", result);

  logger.info("Rendering output", { type: config.output.type });
  await output.render(result, {
    captured,
    processed,
    config
  });

  return {
    captured,
    processed,
    result
  };
}
