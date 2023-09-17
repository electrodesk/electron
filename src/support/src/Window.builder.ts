import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { join } from 'path';
import { singleton } from "tsyringe";

@singleton()
export class WindowBuilder {
  private options: Partial<BrowserWindowConstructorOptions> = {
    width: 640,
    height: 480,
    webPreferences: {
      preload: join(__dirname, "preload.js")
    },
    show: false,
    title: 'Application',
  };

  withDimension(width: number, height: number) {
    this.options = { 
      ...this.options,
      width: Math.abs(width),
      height: Math.abs(height)
    }
    return this;
  }

  withShow(show: boolean): this {
    this.options = {
      ...this.options,
      show
    }
    return this;
  }

  withTitle(title: string): this {
    this.options = {
      ...this.options,
      title
    }
    return this;
  }

  withIcon(icon: string): this {
    this.options = {
      ...this.options,
      icon
    }
    return this;
  }

  withTitleBarStyle(style: BrowserWindowConstructorOptions['titleBarStyle']): this {
    this.options = {
      ...this.options,
      titleBarStyle: style
    }

    return this
  }

  withDevTools(devTools: boolean | undefined): this {
    this.options = {
      ...this.options,
      webPreferences: {
        ...(this.options.webPreferences ?? {}),
        devTools
      }
    }
    return this;
  }

  withParent(parent: BrowserWindow): this {
    this.options = {
      ...this.options,
      parent
    }
    return this
  }

  build(): BrowserWindow {
    return new BrowserWindow(this.options);
  }
}
