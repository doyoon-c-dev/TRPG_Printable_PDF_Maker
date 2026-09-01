import { Button, Image, Box, Text } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useDropzone } from "react-dropzone";
import { LuX, LuCheck } from "react-icons/lu";
import { fileToImage, type ImageData } from "@/components/utils/fileToImage";
import { toaster } from "@/components/ui/toaster";

interface FileUploadComponentProps {
    selectedImage?: ImageData | null;
    setSelectedImage?: Dispatch<SetStateAction<ImageData | null>>;
    uploadedImages?: ImageData[];
    setUploadedImages?: Dispatch<SetStateAction<ImageData[]>>;
}

export default function FileUploadComponent({
    selectedImage = null,   //선택된 이미지
    setSelectedImage,       //선택된 이미지 변경
    uploadedImages = [],    //업로드된 이미지
    setUploadedImages,      //업로드된 이미지 추가
}: FileUploadComponentProps = {}) {

    //이미지 클릭
    //선택된 이미지를 변경 혹은 해제
    const onImgClick = (key: string) => {

        if (!setSelectedImage) return;

        if (selectedImage?.key === key) {
            setSelectedImage(null);
        } else {
            setSelectedImage(uploadedImages.find((img) => img.key === key) ?? null);
        }
    };

    //이미지 삭제
    //선택된 이미지를 해제하고, 업로드된 이미지에서 삭제
    const onDeleteImg = (key: string) => {

        if (!setSelectedImage || !setUploadedImages) return;

        if (selectedImage?.key === key) {
            setSelectedImage(null);
        }

        setUploadedImages((prev) => prev.filter((image) => image.key !== key));
    };

    //파일 드롭
    //파일을 업로드하고, 업로드된 이미지에 추가
    const onDrop = useCallback(async (files: File[]) => {

        if (!setUploadedImages) return;

        try {
            //받아온 파일들을 이미지로 변환
            const images = await Promise.all(
                files.map(async (file) => {
                    const image = await fileToImage(file);
                    return image;
                })
            );

            //업로드된 이미지에 추가
            setUploadedImages((prev) => {
                const existingFiles = new Set(prev.map(({ key }) => key));
                const newFiles = images.filter(({ key }) => {

                    //이미 중복된 파일이 있다면 추가하지 않음
                    if (existingFiles.has(key)) return false;
                    existingFiles.add(key);
                    return true;
                });

                return [...prev, ...newFiles];
            });
        } catch {
            toaster.create({
                title: "File upload failed",
                description: "Only image files (PNG, JPG, JPEG) can be uploaded. Please check the file.",
                type: "error",
                duration: 5000,
            });
        }
    }, [setUploadedImages]);


    //드롭존 설정
    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
        multiple: true,
        noClick: true,
    });

    return (
        <Box width="80%">
            {/* 파일 업로드 영역 */}
            {/* 드랍존 */}
            <Box
                {...getRootProps()}
                flexDirection="column"
                m={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
            >
                <Button onClick={open} aria-label="upload files (PNG, JPG)">Upload Files</Button>
                <input {...getInputProps()} aria-label="upload files (PNG, JPG)" />
                {/* 업로드된 이미지 목록 */}
                {uploadedImages.length > 0 ? (
                    <Box
                        role="list"
                        aria-label="uploaded images"
                        display="flex"
                        flexDirection="row"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        overflowX="auto"
                        overflowY="hidden"
                        width={{ base: "100%", md: "80%" }}
                        p="15px"
                        gap="15px"
                        border="1px solid lightgray"
                        backgroundColor={isDragActive ? "lightgray" : "white"}
                    >
                        {uploadedImages.map((imgData) => {
                            const isSelected = selectedImage?.key === imgData.key;
                            return (
                                <Box
                                    key={imgData.key}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-label={`${imgData.file.name} ${isSelected ? "(selected)" : "select"}`}
                                    position="relative"
                                    border={isSelected ? "3px solid lightblue" : "3px solid lightgray"}
                                    borderRadius={15}
                                    justifyContent="center"
                                    alignItems="flex-end"
                                    width="150px"
                                    height="auto"
                                    flexDirection="column"
                                    gap="2px"
                                    p="5px"
                                    onClick={() => onImgClick(imgData.key)}
                                    _focusVisible={{ outline: "3px solid #3182ce", outlineOffset: "2px" }}
                                >
                                    {/* 선택 상태 체크 아이콘 */}
                                    {isSelected && (
                                        <Box
                                            position="absolute"
                                            top="6px"
                                            left="6px"
                                            bg="blue.400"
                                            borderRadius="full"
                                            p="2px"
                                            color="white"
                                            aria-hidden="true"
                                        >
                                            <LuCheck size={12} />
                                        </Box>
                                    )}
                                    <Button
                                        position="absolute"
                                        top="4px"
                                        right="4px"
                                        size="xs"
                                        variant="ghost"
                                        rounded="full"
                                        aria-label={`${imgData.file.name} delete image`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteImg(imgData.key);
                                        }}
                                    >
                                        <LuX aria-hidden="true" />
                                    </Button>
                                    <Image
                                        src={imgData.image.src}
                                        alt={imgData.file.name}
                                        width="100%"
                                        height="auto"
                                        objectFit="contain"
                                    />
                                    <Text fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{imgData.file.name}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    // 파일이 없을 때
                    <Box
                        border="1px dashed lightgray"
                        backgroundColor={isDragActive ? "lightgray" : "white"}
                        justifyContent="center"
                        alignItems="center"
                        width="80%"
                        height="200px"
                        flexDirection="row"
                        display="flex"
                        aria-label="file drop area"
                        gap={2}
                    >
                        <HiUpload aria-hidden="true" />
                        <Text fontSize={{ base: "xs", md: "sm" }}>Drag and drop files here. (png, jpg, jpeg only)</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
