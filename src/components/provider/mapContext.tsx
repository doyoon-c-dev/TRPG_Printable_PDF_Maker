import { CanvasContext } from "@/components/context/canvasContext";
import { ImageContext } from "@/components/context/imageContext";
import { PdfContext, type GeneratedPdf } from "@/components/context/pdfContext";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type CanvasSettings } from "@/components/context/canvasContext";
import { type ImageData } from "@/components/utils/fileToImage";
import { PDFDocument } from "pdf-lib";
import type { SplitPages } from "../utils/canvas/splitPages";
import { makePdf } from "../utils/canvas/makePdf";

export function MapContextProvider({ children }: { children: ReactNode }) {

  //현재 viewport에 보이고 있는 선택된 이미지의 데이터
  //id: string, file:File, image:HTMLImageElement
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  //현재 업로드된 이미지들의 이미지데이터 배열
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);

  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    isPx: true,

    marginTop: 100,
    marginBottom: 100,
    marginLeft: 100,
    marginRight: 100,

    paperWidth: 2480,
    paperHeight: 3508,

    isGrid: true,
    gridSize: 300,
    gridPenColor: "#000000",
    gridPenSize: 10,

    scale: 100,

  })

  //한 페이지 당 이미지를 가져올 좌상단 점 좌표와 너비, 높이가 저장되어 있음
  const [pages, setPages] = useState<SplitPages[]>([]);

  //마우스로 드래그 입력받아 gridSize를 정할 때 마우스이벤트 모드인지 여부
  const [isResizingGrid, setIsResizingGrid] = useState(false);

  //생성된 pdf들의 배열
  //id:string, name:string, blob:Blob, previewUrl:string, createdAt: number
  const [generatedPdfs, setGeneratedPdfs] = useState<GeneratedPdf[]>([]);

  //deletePdf나 useCallback에서 오래된 state 사용하지 않도록 ref 생성
  const generatedPdfsRef = useRef(generatedPdfs);
  useEffect(() => {
    generatedPdfsRef.current = generatedPdfs;
  }, [generatedPdfs]);

  //true : pdf생성 혹은 merge download 중
  const [isLoading, setIsLoading] = useState(false);
  //pdf 생성 중 혹은 merge download 중
  const [loadingMessage, setLoadingMessage] = useState("");

  //현재 선택된 이미지를 pdf로 변환한 뒤 pdfList에 추가
  /*const addPdf = useCallback(async () => { 

    //현재 선택된 이미지가 없으면 종료
    //이미 pdf 생성 중이면 중복 실행 방지로 종료
    if (!selectedImage || isLoading) return;

    //로딩중으로 상태 변경 후 message설정
    setIsLoading(true);
    setLoadingMessage("PDF 생성 중...");

    try{
      //상태 변경 직후 로딩 ui를 그릴 시간을 줌
      await new Promise<void>((resolve) => { setTimeout(resolve, 0); });

      //worker로 이미지 전달하기 위해 HTMLImageElement를 비트맵으로 변환
      const imageBitmap = await createImageBitmap(selectedImage.image);

      //worker 비동기 이벤트방식이므로 await, Promise 사용
      //result = { pdf, preview }
      const result = await new Promise<{ pdf: ArrayBuffer; preview: Blob }>((resolve, reject) => {

        //pdf 생성을 별도의 worker 스레드에서 실행
        //pdf 계산하느라 멈추는 것을 줄여줌
        const worker = new Worker( new URL("../utils/workers/pdf.worker.ts", import.meta.url), { type: "module" });

        //worker에서 결과를 보내면
        worker.onmessage = (event: MessageEvent<{ pdf?: ArrayBuffer; preview?: Blob; error?: string }>) => {
          //worker 종료
          worker.terminate();
          
          //오류 확인
          //pdf나 preview가 있는지 확인
          //pdf는 실제 pdf 파일, preview는 미리보기로 보여줄 image
          if (event.data.error || !event.data.pdf || !event.data.preview) {
            reject(new Error(event.data.error ?? "PDF 생성에 실패했습니다."));
            return;
          }
          resolve({ pdf: event.data.pdf, preview: event.data.preview });
        };

        //실행 자체를 못 하면 종료
        worker.onerror = () => {
          worker.terminate();
          reject(new Error("PDF worker를 실행할 수 없습니다."));
        };
        //worker에 데이터 전달
        worker.postMessage({ image: imageBitmap, option: canvasSettings, pages }, [imageBitmap]);
      });

      //새 pdf 추가
      setGeneratedPdfs(prev => [...prev, {
        id: crypto.randomUUID(),
        name: `split_${selectedImage.file.name}.pdf`,              //file name
        blob: new Blob([result.pdf], { type: "application/pdf" }), //pdf
        previewUrl: URL.createObjectURL(result.preview),           //preview 이미지
        createdAt: Date.now(),
      }]);
    }
    finally{
      //완료되면 로딩을 종료하고 message도 초기화
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [canvasSettings, isLoading, pages, selectedImage]);*/


  const addPdf = useCallback(async () => {
    const result = await makePdf({
      image: selectedImage.image,
      option: canvasSettings,
      pages: pages
    });

    if (!result) return;

    setGeneratedPdfs(prev => [...prev, {
      id: crypto.randomUUID(),
      name: `split_${selectedImage.file.name}.pdf`,              //file name
      blob: result.blob, //pdf
      previewUrl: result.previewUrl,           //preview 이미지
      createdAt: Date.now(),
    }]);

    setIsLoading(false);
    setLoadingMessage("");
  }, [canvasSettings, isLoading, pages, selectedImage]);

  //pdf리스트에서 pdf 삭제
  //useCallback -> 최초 생성 후 재사용
  const deletePdf = useCallback((id: string) => {
    //id로 삭제할 pdf 식별
    const target = generatedPdfsRef.current.find(pdf => pdf.id === id);

    //미리보기 Url 브라우저 메모리에서 해제
    if (target?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(target.previewUrl);
    }

    //새 배열 저장
    setGeneratedPdfs(prev => prev.filter(pdf => pdf.id !== id));
  }, []);

  //pdf 개별 저장 버튼 클릭시 실행
  const downloadPdf = useCallback((id: string) => {
    //id로 다운로드할 pdf 식별
    const pdf = generatedPdfs.find(item => item.id === id);
    //pdf가 존재하지 않을 시 종료
    if (!pdf) return;

    //url을 통해 pdf 다운로드
    const url = URL.createObjectURL(pdf.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdf.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);

  }, [generatedPdfs]);

  //pdf 리스트 병합하여 다운로드
  const mergePdfs = useCallback(async () => {

    //pdf리스트가 없거나 loading 중이면 종료
    if (generatedPdfs.length === 0 || isLoading) return;

    //로딩 중으로 변경하고 message 설정
    setIsLoading(true);
    setLoadingMessage("PDF 다운로드 중...");

    try {
      //상태 변경 직후 로딩 ui를 그릴 시간을 줌
      await new Promise<void>((resolve) => setTimeout(resolve, 0));


      //새로운 mergedPdf를 생성
      const mergedPdf = await PDFDocument.create();

      //pdf 리스트 하나씩 순회
      for (const generatedPdf of generatedPdfs) {

        //blob형태로 저장되어 있는 pdf파일을 arrayBuffer로 변환하여 PDFDocument로 읽어들임 
        const sourcePdf = await PDFDocument.load(await generatedPdf.blob.arrayBuffer());

        //모든 페이지를 가져옴
        //copyPages(sourcePdf, [0,1,2]) // sourcePdf에서 0,1,2번째 페이지들을 가져옴
        //getPageIndicies() //pdf의 모든 페이지 번호를 가져옴
        const pagesToCopy = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

        //pagesToCopy를 순회하면서 각 페이지당 addPage 호출하여 페이지 추가
        pagesToCopy.forEach(page => mergedPdf.addPage(page));
      }

      //메모리 상에서 만든 mergedPdf를 Byte로 변환 Uint8Array 형태
      const mergedBytes = await mergedPdf.save();

      //mergedByte 만큼의 버퍼 생성
      const mergedBuffer = new ArrayBuffer(mergedBytes.byteLength);

      //버퍼에 데이터 복사
      new Uint8Array(mergedBuffer).set(mergedBytes);

      //브라우저에서 사용 가능한 Blob으로 만듦
      const mergedBlob = new Blob([mergedBuffer], { type: "application/pdf" });

      //다운로드를 위한 임시 url 생성
      const url = URL.createObjectURL(mergedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged-maps.pdf";

      //클릭 이벤트 실행하여 pdf 다운로드
      link.click();

      //Blob url 제거
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    //try에서 에러가 발생해도 실행됨
    finally {
      //로딩 종료
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [generatedPdfs, isLoading]);

  //메모리 누수 방지
  //언마운트 될 때 임시 url 전부 삭제
  useEffect(() => {
    return () => {
      generatedPdfsRef.current.forEach((pdf) => {
        if (pdf.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(pdf.previewUrl);
        }
      });
    };
  }, []);

  //useMemo 사용하여 값이 변경되었을 때만 실행
  const imageContextValue = useMemo(() => ({
    selectedImage,
    setSelectedImage,
    uploadedImages,
    setUploadedImages,
  }), [selectedImage, uploadedImages]);

  const canvasContextValue = useMemo(() => ({
    canvasSettings,
    pages,
    setPages,
    setCanvasSettings,
    isResizingGrid,
    setIsResizingGrid,
  }), [canvasSettings, isResizingGrid, pages]);

  const pdfContextValue = useMemo(() => ({
    generatedPdfs,
    addPdf,
    deletePdf,
    downloadPdf,
    mergePdfs,
    isLoading,
    loadingMessage,
  }), [addPdf, deletePdf, downloadPdf, generatedPdfs, isLoading, loadingMessage, mergePdfs]);

  return (
    <ImageContext.Provider value={imageContextValue}>
      <CanvasContext.Provider value={canvasContextValue}>
        <PdfContext.Provider value={pdfContextValue}>
          {children}
        </PdfContext.Provider>
      </CanvasContext.Provider>
    </ImageContext.Provider>
  );
}