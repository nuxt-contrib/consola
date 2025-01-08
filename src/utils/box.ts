import { getColor } from "./color";
import { stripAnsi } from "./string";

export type BoxBorderStyle = {
  /**
   * Top left corner
   * @example `┌`
   * @example `╔`
   * @example `╓`
   */
  tl: string;
  /**
   * Top right corner
   * @example `┐`
   * @example `╗`
   * @example `╖`
   */
  tr: string;
  /**
   * Bottom left corner
   * @example `└`
   * @example `╚`
   * @example `╙`
   */
  bl: string;
  /**
   * Bottom right corner
   * @example `┘`
   * @example `╝`
   * @example `╜`
   */
  br: string;
  /**
   * Horizontal line
   * @example `─`
   * @example `═`
   * @example `─`
   */
  h: string;
  /**
   * Vertical line
   * @example `│`
   * @example `║`
   * @example `║`
   */
  v: string;
};

const boxStylePresets: Record<string, BoxBorderStyle> = {
  solid: {
    tl: "┌",
    tr: "┐",
    bl: "└",
    br: "┘",
    h: "─",
    v: "│",
  },
  double: {
    tl: "╔",
    tr: "╗",
    bl: "╚",
    br: "╝",
    h: "═",
    v: "║",
  },
  doubleSingle: {
    tl: "╓",
    tr: "╖",
    bl: "╙",
    br: "╜",
    h: "─",
    v: "║",
  },
  doubleSingleRounded: {
    tl: "╭",
    tr: "╮",
    bl: "╰",
    br: "╯",
    h: "─",
    v: "║",
  },
  singleThick: {
    tl: "┏",
    tr: "┓",
    bl: "┗",
    br: "┛",
    h: "━",
    v: "┃",
  },
  singleDouble: {
    tl: "╒",
    tr: "╕",
    bl: "╘",
    br: "╛",
    h: "═",
    v: "│",
  },
  singleDoubleRounded: {
    tl: "╭",
    tr: "╮",
    bl: "╰",
    br: "╯",
    h: "═",
    v: "│",
  },
  rounded: {
    tl: "╭",
    tr: "╮",
    bl: "╰",
    br: "╯",
    h: "─",
    v: "│",
  },
};

export type BoxStyle = {
  /**
   * The border color
   * @default 'white'
   */
  borderColor:
    | "black"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "gray"
    | "blackBright"
    | "redBright"
    | "greenBright"
    | "yellowBright"
    | "blueBright"
    | "magentaBright"
    | "cyanBright"
    | "whiteBright";

  /**
   * The border style
   * @default 'solid'
   * @example 'single-double-rounded'
   * @example
   * ```ts
   * {
   *   tl: '┌',
   *   tr: '┐',
   *   bl: '└',
   *   br: '┘',
   *   h: '─',
   *   v: '│',
   * }
   * ```
   */
  borderStyle: BoxBorderStyle | keyof typeof boxStylePresets;

  /**
   * The vertical alignment of the text
   * @default 'center'
   */
  valign: "top" | "center" | "bottom";

  /**
   * The padding of the box
   * @default 2
   */
  padding: number;

  /**
   * The left margin of the box
   * @default 1
   */
  marginLeft: number;

  /**
   * The top margin of the box
   * @default 1
   */
  marginTop: number;

  /**
   * The top margin of the box
   * @default 1
   */
  marginBottom: number;
};

/**
 * The border options of the box
 */
export type BoxOpts = {
  /**
   * Title that will be displayed on top of the box
   * @example 'Hello World'
   * @example 'Hello {name}'
   */
  title?: string;

  style?: Partial<BoxStyle>;
};

/**
 * The default style applied to a box if no custom style is specified. See {@link BoxStyle}.
 */
const defaultStyle: BoxStyle = {
  borderColor: "white",
  borderStyle: "rounded",
  valign: "center",
  padding: 2,
  marginLeft: 1,
  marginTop: 1,
  marginBottom: 1,
};

/**
 * Creates a styled box with text content, customisable via options.
 * @param {string} text - The text to display in the box.
 * @param {BoxOpts} [_opts={}] - Optional settings for the appearance and behaviour of the box. See {@link BoxOpts}.
 * @returns {string} The formatted box as a string, ready for printing or logging.
 */
export function box(text: string, _opts: BoxOpts = {}) {
  const opts = {
    ..._opts,
    style: {
      ...defaultStyle,
      ..._opts.style,
    },
  };

  // Split the text into lines
  const textLines = text.split("\n");

  // Create the box
  const boxLines = [];

  // Get the characters for the box and colorize
  const _color = getColor(opts.style.borderColor);
  const borderStyle = {
    ...(typeof opts.style.borderStyle === "string"
      ? boxStylePresets[
          opts.style.borderStyle as keyof typeof boxStylePresets
        ] || boxStylePresets.solid
      : opts.style.borderStyle),
  };
  if (_color) {
    for (const key in borderStyle) {
      borderStyle[key as keyof typeof borderStyle] = _color(
        borderStyle[key as keyof typeof borderStyle],
      );
    }
  }

  // Calculate the width and height of the box
  const paddingOffset =
    opts.style.padding % 2 === 0 ? opts.style.padding : opts.style.padding + 1;
  const height = textLines.length + paddingOffset;
  const width =
    Math.max(...textLines.map((line) => stripAnsi(line).length)) +
    paddingOffset;
  const widthOffset = width + paddingOffset;

  const leftSpace =
    opts.style.marginLeft > 0 ? " ".repeat(opts.style.marginLeft) : "";

  // Top line
  if (opts.style.marginTop > 0) {
    boxLines.push("".repeat(opts.style.marginTop));
  }
  // Include the title if it exists with borders
  if (opts.title) {
    const title = _color ? _color(opts.title) : opts.title;
    const left = borderStyle.h.repeat(
      Math.floor((width - stripAnsi(opts.title).length) / 2),
    );
    const right = borderStyle.h.repeat(
      width -
        stripAnsi(opts.title).length -
        stripAnsi(left).length +
        paddingOffset,
    );
    boxLines.push(
      `${leftSpace}${borderStyle.tl}${left}${title}${right}${borderStyle.tr}`,
    );
  } else {
    boxLines.push(
      `${leftSpace}${borderStyle.tl}${borderStyle.h.repeat(widthOffset)}${
        borderStyle.tr
      }`,
    );
  }

  // Middle lines
  const valignOffset =
    opts.style.valign === "center"
      ? Math.floor((height - textLines.length) / 2)
      : opts.style.valign === "top" // eslint-disable-line unicorn/no-nested-ternary
        ? height - textLines.length - paddingOffset
        : height - textLines.length;

  for (let i = 0; i < height; i++) {
    if (i < valignOffset || i >= valignOffset + textLines.length) {
      // Empty line
      boxLines.push(
        `${leftSpace}${borderStyle.v}${" ".repeat(widthOffset)}${
          borderStyle.v
        }`,
      );
    } else {
      // Text line
      const line = textLines[i - valignOffset];
      const left = " ".repeat(paddingOffset);
      const right = " ".repeat(width - stripAnsi(line).length);
      boxLines.push(
        `${leftSpace}${borderStyle.v}${left}${line}${right}${borderStyle.v}`,
      );
    }
  }

  // Bottom line
  boxLines.push(
    `${leftSpace}${borderStyle.bl}${borderStyle.h.repeat(widthOffset)}${
      borderStyle.br
    }`,
  );
  if (opts.style.marginBottom > 0) {
    boxLines.push("".repeat(opts.style.marginBottom));
  }

  return boxLines.join("\n");
}
