import { usePage } from "@inertiajs/react";
import React from "react";
import ReactMarkDown from 'react-markdown';
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptDropDown from "./MessageOptDropDown";

const MessageItem = ({message , onAttachClick})=>{
    const currentUser = usePage().props.auth.user;
    return (
        <div className={
            "chat " + (message.sender_id === currentUser.id ? "chat-end":"chat-start")
        }>
            {<UserAvatar user={message.sender} />}
            <div className="chat-header">
                {message.sender_id !== currentUser.id
                    ? message.sender.name 
                    :""
                }
                <time className="ml-2 text-xs opacity-50">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
            <div
                className={"chat-bubble relative " + (message.sender_id === currentUser.id? " chat-bubble-info":"")}
            >
               {message.sender_id === currentUser.id && (
                <MessageOptDropDown message={message} />
               )}
                <div className="chat-message">
                <div className="chat-message-content">
                 <ReactMarkDown>{message.message}</ReactMarkDown>
             </div>
                <MessageAttachments attachments={message.attachments} onAttachClick={onAttachClick} />
                </div>
            </div>
        </div>
    )
}

export default MessageItem;