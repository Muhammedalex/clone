import { router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState } from "react";
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";
const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConv = page.props.selectedConversation;
    const [onlineUsers , setOnlineUsers] = useState({});
    const [localConversations , setLocalConversations] = useState([]);
    const [sortedConversations , setSortedConversations] = useState([]);
    const [ showGroupModal , setShowGroupModal] = useState(false)
    const {on} = useEventBus();
   const isUserOnline = (userId)=>onlineUsers[userId];

   const onSearch =(e)=>{
    const search = e.target.value.toLowerCase();
    setLocalConversations(
        conversations.filter((conv)=>{
            return (conv.name.toLowerCase().includes(search));
        })
    )
   }

   const messageCreated = (message) =>{
        setLocalConversations((oldUsers)=>{
            return oldUsers.map((u)=>{
                if(
                    message.receiver_id &&
                    u.is_user &&
                    (u.id == message.sender_id || u.id == message.receiver_id)
                ){
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                if(
                    message.group_id &&
                    u.is_group &&
                    u.id == message.group_id
                ){
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                return u;
            });
        })
   }
   const messageDeleted = ({prevMessage})=>{
        if(!prevMessage){
            return;
        }

        //find conve by prevMessage and update last message and date 

       messageCreated(prevMessage);
   }
   useEffect(()=>{
    const offCreated = on('message.created',messageCreated);
    const offDeleted = on('message.deleted',messageDeleted);
    const offModalShow = on('GroupModal.show',(group)=>{
        setShowGroupModal(true);
    });
    const offGroupDelete = on('group.deleted',({id,name})=>{
        setLocalConversations((oldConv)=>{
            return oldConv.filter((con)=>con.id != id);
        });
        if(!selectedConv || selectedConv.is_group &&
            selectedConv.id == id
        ){
            router.visit(route("dashboard"));
        }
    });

    return ()=>{
        offCreated();
        offDeleted();
        offModalShow();
        offGroupDelete();
    }
   },[on])
    useEffect(()=>{
        setLocalConversations(conversations);
    },[conversations])
    useEffect(()=>{
        setSortedConversations(
            localConversations.sort((a,b)=>{
                if(a.blocked_at && b.blocked_at){
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if(a.blocked_at){
                    return 1;
                } else if(b.blocked_at){
                    return -1;
                }
                if(a.last_message_date && b.last_message_date){
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if(a.last_message_date){
                    return -1;
                } else if(b.last_message_date){
                    return 1;
                } else {
                    return 0
                }
            })
        );
    },[localConversations])
    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(users.map((user)=>[user.id,user]));
                setOnlineUsers((prev)=>{
                    return {...prev,...onlineUsersObj}
                });

            })
            .joining((user) => {
                setOnlineUsers((prev)=>{
                    const updatedUsers = {... prev};
                    updatedUsers[user.id]=user;
                    return updatedUsers;
                })


            })
            .leaving((user) => {
                setOnlineUsers((prev)=>{
                    const updatedUsers = { ... prev};
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });

            })
            .error((error) => {
                console.error('error', error);
            });
            return ()=>{
                Echo.leave("online");
            }
    }, []);
    return (
        <>
            <div className="flex flex-1 w-full overflow-hidden">
                <div className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden ${selectedConv ? "-ml-[100%] sm:ml-0" : ""}`}>
                    <div className="flex items-center justify-between px-3 py-2 text-xl font-medium text-white">
                        My Conversations
                        <div className="tooltip tooltip-left" data-tip="Create new Group">
                            <button onClick={(e)=> setShowGroupModal(true)} className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="inline-block w-4 h-4 ml-2" />
                            </button>
                        </div>
                    
                    </div>
                    <div className="p-3">
                        <TextInput onKeyUp={onSearch}
                            placeholder="filer users and groups"
                            className='w-full'
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversations && sortedConversations.map((conv)=>(
                            <ConversationItem
                                key={`${
                                    conv.is_group?"group_":"user_"
                                }${conv.id}`}
                                conversation = {conv}
                                online={!!isUserOnline(conv.id)}
                                selected = {selectedConv}
                            />
                        ))}
                    </div>
                </div>
                <div className='flex flex-col flex-1 overflow-hidden'>
                    {children}
                </div>
            </div>
            <GroupModal show={showGroupModal} onClose={()=>setShowGroupModal(false)}  />
        </>
    );
};

export default ChatLayout;
