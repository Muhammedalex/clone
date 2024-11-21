import {
    FaceSmileIcon,
    HandThumbUpIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    PhotoIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import NewMsgInput from "./NewMsgInput";
import axios from "axios";
import { Popover } from "@headlessui/react";
import EmojiPicker from "emoji-picker-react";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { isAudio, isImage } from "@/helpers";
import AudioRecorder from "./AudioRecorder";
import { useEventBus } from "@/EventBus";


const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState("");
    const [inputErrorMessage, setInputErrorMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles,setChosenFiles]=useState([]);
    const [uploadProgress , setUploadProgress]=useState(0);
    
    const onClickHand = () =>{
        if(messageSending){return;}
        //  setNewMessage("👍");
        const data = {
            message: "👍",
        }
        if (conversation.is_user) {
            data['receiver_id']=conversation.id;
        } else if (conversation.is_group) {
            data['group_id']=conversation.id;
        }
          axios
            .post(route("message.store"),data)

            
    }

    const onFileChange = (e)=>{
        const files=e.target.files;
        const updateFiles = [...files].map(file=>{
            return {
                file:file,
                url:URL.createObjectURL(file),
            };
        });
        setChosenFiles((prev)=>{
            return [...prev , ...updateFiles];
        });

    }
    const recordedAudioReady = (file,url) =>{
        setChosenFiles((prev)=>{
            return [
                ...prev,
                {
                    file:file,
                    url:url
                },
            ];
        });
    };
    const onSendClick = () => {
        if (newMessage.trim() === ""&&  chosenFiles.length === 0) {
            setInputErrorMessage(
                "Please provide a message or upload attachments."
            );
            setTimeout(() => {
                setInputErrorMessage("");
            }, 3000);
            return;
        }
        const formData = new FormData();
        chosenFiles.forEach((file)=>{
            formData.append("attachments[]",file.file);
        })
        formData.append("message", newMessage);
        if (conversation.is_user) {
            formData.append("receiver_id", conversation.id);
        } else if (conversation.is_group) {
            formData.append("group_id", conversation.id);
        }
        setMessageSending(true);
        const headers = {
            'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
            // Add any additional headers here if needed
        };
        axios.post(route("message.store"), formData, {
            headers: headers, // Pass the headers object
            onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                );
                setUploadProgress(progress);
            },
        })
            .then((response) => {
                setNewMessage("");
                setMessageSending(false);
                setUploadProgress(0);
                setChosenFiles([]);

            })
            .catch((err) => {
                setMessageSending(false);
                setChosenFiles([]);
                const message = err?.response?.data?.message;
                setInputErrorMessage(message||"Something Went Wrong")
            });
    };
    return (
        <div className="flex flex-wrap py-3 border-t item-start border-slate-700">
            <div className="flex-1 order-2 p-2 xs:flex-none xs:order-1">
                <button className="relative p-1 text-gray-400 hover:text-gray-300">
                    <PaperClipIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="absolute top-0 bottom-0 left-0 right-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <button className="relative p-1 text-gray-400 hover:text-gray-300">
                    <PhotoIcon className="w-6" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        accept="image/*, video/*"
                        className="absolute top-0 bottom-0 left-0 right-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <AudioRecorder fileReady={recordedAudioReady} />
            </div>
            <div className="order-1 px-3 xs:p-0 min-w-[220px] basis-full xs:basis-0 xs:order-2 flex-1 relative">
                <div className="flex ">
                    <NewMsgInput
                        value={newMessage}
                        onSend={onSendClick}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        onClick={onSendClick}
                        className="rounded-l-none btn btn-info "
                    >
                        {messageSending && (
                            <span className="loading loading-spinner loading-xs"></span>
                        )}
                        <PaperAirplaneIcon className="w-6" />
                        <span className="hidden sm:inline">send</span>
                    </button>
                </div>
                {!!uploadProgress && (
                    <progress className="w-full progress progress-info" value={uploadProgress} max="100">

                    </progress>
                )}
                {inputErrorMessage && (
                    <p className="text-xs text-red-400">{inputErrorMessage}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                    {chosenFiles.map((file)=>(
                        <div
                            key={file.file.name}
                            className={`
                                relative flex justify-between cursor-pointer 
                            ` + (!isImage(file.file)?"w-[240px]":"")}
                        >
                                {isImage(file.file)&& (
                                    <img
                                        src={file.url}
                                        alt="uploaded"
                                        className="object-cover w-16 h-16"
                                    />
                                )}
                                {isAudio(file.file)&&(
                                    <CustomAudioPlayer
                                        file={file}
                                        showVolume={false}
                                    />
                                )}
                                {!isAudio(file.file)&& !isImage(file.file)&&(
                                    <AttachmentPreview file={file} />
                                )}
                                <button
                                    onClick={()=>{
                                        setChosenFiles(
                                            chosenFiles.filter((f)=>f.file.name !==file.file.name)
                                        )
                                    }}
                                    className="absolute z-10 w-6 h-6 text-gray-300 bg-gray-800 rounded-full -right-2 -top-2 hover:text-gray-100"
                                >
                                    <XCircleIcon className="w-6" />
                                </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex order-3 p-2 xs:order-3">
                <Popover className='relative'>
                    <Popover.Button className='p-1 text-gray-400 hover:text-gray-300'>
                    <FaceSmileIcon className="w-6 h-6" />
                    </Popover.Button>
                    <Popover.Panel className='absolute right-0 z-20 bottom-full'>
                        <EmojiPicker theme="dark" onEmojiClick={e=>setNewMessage(newMessage + e.emoji)}>
                            
                        </EmojiPicker>
                    </Popover.Panel>
                </Popover>
               
                <button onClick={onClickHand} className="p-1 text-gray-400 hover:text-gray-300">
                    <HandThumbUpIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
