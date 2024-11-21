import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';
import MessageItem from '@/Components/App/MessageItem';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';
import AttachmentPreviewModal from '@/Components/App/AttachmentPreviewModal';

// import { Head } from '@inertiajs/react';

function Home({ messages=null ,selectedConversation=null }) {
    const [localMessages,setLocalMessages]=useState([]);
    const [noMoreMsgs,setNoMoreMsgs]=useState(false);
    const [scrollForBottom,setScrollFromBottom]=useState(0);
    const [showAttachmentPrev,setShowAttachmentPrev]=useState(false);
    const [prevAttach,setPrevAttach]=useState({});

    const {on} = useEventBus();
    const messagesCtrRef = useRef(null);
    const loadMoreIntesect = useRef(null);
    const messageCreated = (message)=>{
       
        if(selectedConversation 
            && selectedConversation.is_group
            && selectedConversation.id == message.group_id){
            setLocalMessages((prev)=>[...prev,message]);

        }

        if(
            selectedConversation && selectedConversation.is_user&& message.receiver_id&&
          (selectedConversation.id == message.sender_id 
            || selectedConversation.id == message.receiver_id)){
            setLocalMessages((prev)=>[...prev,message]);
        }
    };
    const messageDeleted = ({message})=>{
        if(selectedConversation 
            && selectedConversation.is_group
            && selectedConversation.id == message.group_id){
            setLocalMessages((prev)=>{
                return prev.filter((m)=>m.id !== message.id);
            });

        }

        if(
            selectedConversation && selectedConversation.is_user&& message.receiver_id&&
          (selectedConversation.id == message.sender_id 
            || selectedConversation.id == message.receiver_id)){
            setLocalMessages((prev)=>{
                return prev.filter((m)=>m.id !== message.id);
            });
        }
    }
    const loadMoreMessages = useCallback(()=>{
        if(noMoreMsgs){
            return;
        }
        const firstMessage = localMessages[0];
        axios.get(route('message.loadOlder',firstMessage.id)).then(({data})=>{
            if(data.data.length === 0){
                setNoMoreMsgs(true);
                return;
            }
            const scrollHeight = messagesCtrRef.current.scrollHeight;
            const scrollTop = messagesCtrRef.current.scrollTop;
            const clientHeight = messagesCtrRef.current.clientHeight;
            const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
            setScrollFromBottom(tmpScrollFromBottom);

            setLocalMessages((prev)=>{
                return [...data.data.reverse(), ...prev]
            })
        });
    },[localMessages,noMoreMsgs]);
    const onAttachClick = (attachments , ind)=>{
        setPrevAttach({
            attachments,
            ind,
        });
        setShowAttachmentPrev(true);
    }
    useEffect(()=>{
        setTimeout(()=>{
            if(messagesCtrRef.current){
                messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
            }
        },10);

        const offCreated = on('message.created',messageCreated);
        const offDeleted = on('message.deleted',messageDeleted);

        setScrollFromBottom(0);
        return ()=>{
            offCreated();
            offDeleted();
        }
    },[selectedConversation])
    useEffect(()=>{
        if(localMessages.length>0){
            setLocalMessages([]);
            setNoMoreMsgs(false);
        }
        setLocalMessages(messages? messages.data.reverse():[]);
    },[messages])
    useEffect(()=>{
        if(messagesCtrRef.current && scrollForBottom !==null){
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.offsetHeight -
                scrollForBottom;
        }
        if(noMoreMsgs){
            return;
        }

        const observer = new IntersectionObserver(
            (entries)=>
                entries.forEach(
                    (entry)=> entry.isIntersecting && loadMoreMessages()
                ),
                {
                    rootMargin:"0px 0px 250px 0px"
                }
        );
        if(loadMoreIntesect.current){
            setTimeout(()=>{
                observer.observe(loadMoreIntesect.current);
            },100);
        }
        return ()=>{
            observer.disconnect();
        }
    },[localMessages])
    return (
        <>
    {!messages&&(
        <div className='flex flex-col items-center justify-center h-full gap-8 text-center opacity-35'>
            <div className='p-16 text-2x1 md:text-4x1 text-slate-200'>
                please select Conversation to see Messages
            </div>
            <ChatBubbleLeftRightIcon className='inline-block w-32 h-32' />
        </div>
    )}

{messages?.data && (
        <>
            <ConversationHeader 
                selectedConversation = {selectedConversation}
            />
            <div
                ref={messagesCtrRef}
                className='flex-1 p-5 overflow-y-auto'
            >
                {/* Messages */}
                {localMessages?.length === 0 && (
                    <div className='flex items-center justify-center h-full'>
                        <div className='text-lg text-slate-200'>
                            No messages found
                        </div>
                    </div>
                )}

                {localMessages?.length > 0 && (
                    <>
                    <div className='' ref={loadMoreIntesect}></div>
                    <div className='flex flex-col flex-1'>
                        {localMessages.map((message,i)=>(
                            <MessageItem
                                key = {i}
                                message={message}
                                onAttachClick={onAttachClick}
                            />
                        ))}
                    </div>
                    </>
                )}
            </div>
            <MessageInput conversation = {selectedConversation} />
        </>
    )}
    {prevAttach.attachments && (
        <AttachmentPreviewModal
            attachments = {prevAttach.attachments}
            index = {prevAttach.ind}
            show ={showAttachmentPrev}
            onClose={()=>setShowAttachmentPrev(false)}
        />
    )}
        </>
    );
}

Home.layout = (page)=>{
    return (
        <AuthenticatedLayout
            user={page.props.auth.user}
            children={page}
            >
                <ChatLayout children={page} />
            </AuthenticatedLayout>
    )
}

export default Home;