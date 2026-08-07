export type StudioRightPanelMode = "outputs" | "preview" | "collapsed";

export interface StudioRightPanelState {
  mode: StudioRightPanelMode;
  selectedOutputId?: string;
  selectedVersionId?: string;
}
