import { createContext } from "react";
import type { SplitPages } from "../utils/canvas/splitPages";

export interface CanvasSettings {
    isPx: boolean;          //true : canvasSettings의 값들이 px단위  //false : mm단위 //초기값 true
    marginTop: number;      //상단 여백
    marginBottom: number;   //하단 여백
    marginLeft: number;     //왼쪽 여백
    marginRight: number;    //오른쪽 여백
    paperWidth: number;     //pdf로 저장될 때 최종 canvas width //초기값 A4 기준 2480px
    paperHeight: number;    //pdf로 저장될 때 최종 canvas hegith//초기값 A4 기준 3508px
    isGrid: boolean;        //pdf로 저장할 때 격자를 생성할지에 대한 여부
    gridSize: number;       //정사각형 격자 한칸 사이즈
    gridPenColor: string;   //격자의 색
    gridPenSize: number;    //격자의 펜 두께 //mm로 변환되지 않음 //px 고정
    scale: number;          //이미지 배율 //초기값 100 //퍼센테이지 기준
}

export interface CanvasContextValue {
    canvasSettings: CanvasSettings;
    setCanvasSettings: React.Dispatch<React.SetStateAction<CanvasSettings>>;
    

    // export interface SplitPages {
    //     pageIndex: number;

    //     sourceX: number;
    //     sourceY: number;

    //     sourceWidth: number;
    //     sourceHeight: number;
    // }
    // 한 페이지 당 이미지를 가져올 좌상단 점 좌표와 너비, 높이가 저장되어 있음
    pages: SplitPages[];
    setPages: React.Dispatch<React.SetStateAction<SplitPages[]>>;

    //마우스로 드래그 입력받아 gridSize를 정할 때 마우스이벤트 모드인지 여부
    isResizingGrid: boolean;
    setIsResizingGrid: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);