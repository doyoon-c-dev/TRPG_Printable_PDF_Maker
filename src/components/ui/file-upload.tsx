import { Button, Image, Box, Text } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";
import { useImageContext } from "@/components/hooks/useImageContext";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { LuX } from "react-icons/lu";
import { fileToImage } from "../utils/fileToImage";

const getFileKey = (file: File) =>
    `${file.name}:${file.size}:${file.lastModified}:${file.type}`;

export default function FileUploadComponent() {

    const { selectedImage, setSelectedImage, uploadedImages, setUploadedImages } = useImageContext();

    const onImgClick = (id : string) => {
        if(selectedImage?.id === id){
            setSelectedImage(null);
        }
        else{
            setSelectedImage(uploadedImages.find(img => img.id === id) ?? null);
        }
    }

    const onDeleteImg = (id : string) => {
        if (selectedImage?.id === id) {
            setSelectedImage(null);
        }
        setUploadedImages(prev=> prev.filter( image => image.id !== id));
    }

    const onDrop = useCallback(async (files: File[]) => {
        const images = await Promise.all(
            files.map(async (file) => {
                const image = await fileToImage(file);

                return image;
            })
        );

        setUploadedImages(prev => {
            const existingFiles = new Set(
                prev.map(({ file }) => getFileKey(file))
            );
            const newFiles = images.filter(({ file }) => {
                const key = getFileKey(file);

                if (existingFiles.has(key)) return false;

                existingFiles.add(key);
                return true;
            });

            return [...prev, ...newFiles];
        });
    }, [setUploadedImages]);

    const {getRootProps, getInputProps, open, isDragActive } = useDropzone({
        onDrop: onDrop,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            },
        multiple: true,
        noClick: true,
    });

    return (
        <Box>
            <Box {...getRootProps()} 
                flexDirection="column" 
                m={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
            >
                    <Button onClick={open}>
                        파일 업로드
                    </Button>
                    <input {...getInputProps()}/>
                    {uploadedImages?.length > 0
                        ? <Box
                            border = "1px solid lightgray"
                            backgroundColor= {isDragActive ? "lightgray" : "white"}
                            justifyContent= "center"
                            alignItems= "flex-start"
                            width="80%"
                            height= "auto"
                            flexDirection="row"
                            display="flex"
                            overflowX="auto"
                            p = "15px"
                            gap= "15px"
                            >
                                {uploadedImages.map((imgData)=> (
                                        <Box
                                        position="relative"
                                        border = {selectedImage?.id === imgData.id ? "3px solid lightblue" : "3px solid lightgray"}
                                        borderRadius={15}
                                        justifyContent="center"
                                        alignItems="flex-end"
                                        width= "150px"
                                        height="auto"
                                        flexDirection="column"
                                        gap="2px"
                                        p = "5px"
                                        key={imgData.id}
                                        onClick={()=> onImgClick(imgData.id)}
                                        >
                                            <Button
                                                position="absolute"
                                                top = "4px"
                                                right="4px"
                                                size="xs"
                                                variant="ghost"
                                                rounded="full"
                                                onClick={(e)=> { e.stopPropagation(); onDeleteImg(imgData.id); }}>
                                                <LuX/>
                                            </Button>
                                            <Image src={imgData.image.src}
                                                width="100%"
                                                height="auto"
                                                objectFit="contain"
                                            />
                                        </Box>
                                ))}
                        </Box>
                        : <Box
                            border = "1px dashed lightgray"
                            backgroundColor= {isDragActive ? "lightgray" : "white"}
                            justifyContent= "center"
                            alignItems= " center"
                            width="80%"
                            height= "200px"
                            flexDirection="row"
                            display="flex"
                        >
                            <HiUpload/>
                            <Text>파일을 드래그해주세요.</Text> 
                        
                        </Box>
                    }
            </Box>
        </Box>
    );
}
