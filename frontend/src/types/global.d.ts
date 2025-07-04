// Global type declarations for the Turkish Learning App

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Extend the Web Speech API types
declare namespace webkitSpeechRecognition {
  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }
}

// Audio context types for speech recognition
declare interface AudioContext {
  createAnalyser(): AnalyserNode;
  createMediaStreamSource(stream: MediaStream): MediaStreamAudioSourceNode;
  close(): Promise<void>;
}

declare interface AnalyserNode {
  fftSize: number;
  frequencyBinCount: number;
  getByteFrequencyData(array: Uint8Array): void;
}

declare interface MediaStreamAudioSourceNode {
  connect(destination: AnalyserNode): void;
  disconnect(): void;
}

// Drag and drop types for @hello-pangea/dnd
declare module '@hello-pangea/dnd' {
  export interface DropResult {
    draggableId: string;
    type: string;
    source: DraggableLocation;
    reason: DropReason;
    mode: MovementMode;
    destination?: DraggableLocation | null;
    combine?: Combine | null;
  }

  export interface DraggableLocation {
    droppableId: string;
    index: number;
  }

  export type DropReason = 'DROP' | 'CANCEL';
  export type MovementMode = 'FLUID' | 'SNAP';

  export interface Combine {
    draggableId: string;
    droppableId: string;
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (start: DragStart) => void;
    onDragUpdate?: (update: DragUpdate) => void;
    children: React.ReactNode;
  }

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'vertical' | 'horizontal';
    ignoreContainerClipping?: boolean;
    renderClone?: DraggableChildrenFn;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement;
  }

  export const DragDropContext: React.ComponentType<DragDropContextProps>;
  export const Droppable: React.ComponentType<DroppableProps>;
  export const Draggable: React.ComponentType<DraggableProps>;
}

// Framer Motion types
declare module 'framer-motion' {
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileDrag?: any;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: any;
    dragElastic?: number | boolean;
    dragMomentum?: boolean;
    onDragStart?: (event: any, info: any) => void;
    onDragEnd?: (event: any, info: any) => void;
    layout?: boolean | string;
    layoutId?: string;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }

  export const motion: {
    div: React.ComponentType<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
    span: React.ComponentType<MotionProps & React.HTMLAttributes<HTMLSpanElement>>;
    button: React.ComponentType<MotionProps & React.HTMLAttributes<HTMLButtonElement>>;
    img: React.ComponentType<MotionProps & React.HTMLAttributes<HTMLImageElement>>;
    [key: string]: React.ComponentType<MotionProps & any>;
  };

  export const AnimatePresence: React.ComponentType<{
    children: React.ReactNode;
    mode?: 'wait' | 'sync' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;
}

export {};
