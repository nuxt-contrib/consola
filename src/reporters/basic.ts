import { formatWithOptions } from "node:util";
import type {
  LogObject,
  ConsolaReporter,
  FormatOptions,
  ConsolaOptions,
} from "../types";
import { parseStack } from "../utils/error";
import { writeStream } from "../utils/stream";

const bracket = (x: string) => (x ? `[${x}]` : "");

export class BasicReporter implements ConsolaReporter {
  formatStack(stack: string, opts: FormatOptions) {
    const indent = "  ".repeat((opts?.errorLevel || 0) + 1);
    return indent + parseStack(stack).join(`\n${indent}`);
  }

  formatError(err: any, opts: FormatOptions): string {
    const message = err.message ?? formatWithOptions(opts, err);
    const stack = err.stack ? this.formatStack(err.stack, opts) : "";

    const level = opts?.errorLevel || 0;
    const causedPrefix = level > 0 ? `${"  ".repeat(level)}[cause]: ` : "";
    const causedError = err.cause
      ? "\n\n" + this.formatError(err.cause, { ...opts, errorLevel: level + 1 })
      : "";

    return causedPrefix + message + "\n" + stack + causedError;
  }

  formatArgs(args: any[], opts: FormatOptions) {
    const _args = args.map((arg) => {
      if (arg && typeof arg.stack === "string") {
        return this.formatError(arg, opts);
      }
      return arg;
    });

    // Only supported with Node >= 10
    // https://nodejs.org/api/util.html#util_util_inspect_object_options
    return formatWithOptions(opts, ..._args);
  }

  formatDate(date: Date, opts: FormatOptions) {
    return opts.date ? date.toLocaleTimeString() : "";
  }

  filterAndJoin(arr: any[]) {
    return arr.filter(Boolean).join(" ");
  }

  formatLogObj(logObj: LogObject, opts: FormatOptions) {
    const message = this.formatArgs(logObj.args, opts);

    if (logObj.type === "box") {
      return (
        "\n" +
        [
          bracket(logObj.tag),
          logObj.title && logObj.title,
          ...message.split("\n"),
        ]
          .filter(Boolean)
          .map((l) => " > " + l)
          .join("\n") +
        "\n"
      );
    }

    return this.filterAndJoin([
      bracket(logObj.type),
      bracket(logObj.tag),
      message,
    ]);
  }

  formatLine(logObj: LogObject, ctx: { options: ConsolaOptions }) {
    return this.formatLogObj(logObj, {
      columns: (ctx.options.stdout as any).columns || 0,
      ...ctx.options.formatOptions,
    });
  }

  log(logObj: LogObject, ctx: { options: ConsolaOptions }) {
    const line = this.formatLine(logObj, ctx);
    return writeStream(
      line + "\n",
      logObj.level < 2
        ? ctx.options.stderr || process.stderr
        : ctx.options.stdout || process.stdout,
    );
  }
}
