import { isAudio, isImage, isPDF, isPreviewable, isVideo } from "@/helpers";
import {
    ArrowDownTrayIcon,
    PaperClipIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/solid";

const MessageAttachments = ({ attachments, onAttachClick }) => {
    return (
        <>
            {attachments.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1 mt-2">
                    {attachments.map((attachment,ind) => (
                        <div
                            onClick={(e) => onAttachClick(attachments, ind)}
                            key={attachment.id}
                            className={
                                `group flex flex-col items-center justify-center text-gray-500 relative cursor-pointer ` +
                                (isAudio(attachment)
                                    ? "w-84"
                                    : "w-32 aspect-square bg-blue-100")
                            }
                        >
                            {!isAudio(attachment) && (
                                <a
                                    onClick={(e) => e.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="absolute top-0 right-0 z-20 flex items-center justify-center w-8 h-8 text-gray-100 transition-all bg-gray-700 rounded opacity-100 cursor-pointer group-hover:opacity-100 hover:bg-gray-800"
                                >
                                    <ArrowDownTrayIcon className="w-4" />
                                </a>
                            )}
                            {isImage(attachment) && (
                                <img
                                    src={attachment.url}
                                    className="items-center object-cover aspect-square"
                                />
                            )}
                            {isVideo(attachment) && (
                                <div className="relative flex items-center justify-center">
                                    <PlayCircleIcon className="absolute z-20 w-16 h-16 text-white opacity-70" />
                                    <div className="absolute top-0 left-0 z-10 w-full h-full bg-black/50">
                                        <video src={attachment.url}></video>
                                    </div>
                                </div>
                            )}
                            {isAudio(attachment) && (
                                <div className="relative flex items-center justify-center">
                                    <audio
                                        src={attachment.url}
                                        controls
                                    ></audio>
                                </div>
                            )}
                            {isPDF(attachment) && (
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute top-0 bottom-0 left-0 right-0">
                                    <iframe
                                    src={`storage/attachments/w7UfGCFhIq5wJHfHEztbDl6R7f9jqtcA/fsb4ZsGGbrqRiLxpn9fZWMCJaHOFHH7SaQDPASpy.pdf`}
                                    className="w-full h-full"
                                    ></iframe>
                                    </div>
                                </div>
                            )}
                            {!isPreviewable(attachment) && (
                                <a
                                    onClick={(e) => e.stopPropagation()}
                                    download
                                    href={attachment.url}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <PaperClipIcon className="w-10 h-10 mb-3" />
                                    <small className="text-center">{attachment.name.slice(0,17)+'...'}</small>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default MessageAttachments;
