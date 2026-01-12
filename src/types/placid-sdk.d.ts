/**
 * Type declarations for the Placid Editor SDK
 * @see https://placid.app/docs/2.0/sdk/canvas
 */

interface PlacidCanvasOptions {
  access_token: string;
  template_uuid: string;
  type?: "static" | "animated";
}

interface PlacidLayerValue {
  text?: string;
  text_color?: string;
  image?: string;
  background_color?: string;
  hide?: boolean;
}

interface PlacidLayerInfo {
  name: string;
  type: string;
}

interface PlacidCanvasInstance {
  /**
   * Fill template layers with values based on REST API notation
   */
  fillLayers: (layers: Record<string, PlacidLayerValue>) => void;

  /**
   * Get a list of dynamic layers in the template
   */
  getLayers: () => Promise<PlacidLayerInfo[]>;

  /**
   * Upload a file to temporary storage for use with fillLayers()
   */
  uploadMedia: (
    file: File,
    options?: { onProgress?: (percent: number) => void }
  ) => Promise<{ url: string }>;

  /**
   * Listen for canvas events
   */
  on: (
    event: "canvas:ready" | "canvas:loaded",
    callback: (instance: PlacidCanvasInstance) => void
  ) => void;

  /**
   * Destroy the canvas instance and clean up resources
   */
  destroy: () => void;
}

interface PlacidEditorSDK {
  canvas: {
    create: (
      container: HTMLElement,
      options: PlacidCanvasOptions
    ) => PlacidCanvasInstance;
  };
}

declare global {
  interface Window {
    EditorSDK?: PlacidEditorSDK;
  }
}

export type {
    PlacidCanvasInstance, PlacidCanvasOptions, PlacidEditorSDK, PlacidLayerInfo, PlacidLayerValue
};

