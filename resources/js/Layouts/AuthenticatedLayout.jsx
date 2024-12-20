import { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import Toast from '@/Components/App/Toast';
import NewMessageNotification from '@/Components/App/NewMessageNotification';
import PrimaryButton from '@/Components/PrimaryButton';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import NewUserModal from '@/Components/App/NewUserModal';

export default function Authenticated({ header, children }) {
   const page = usePage();
   const user = page.props.auth.user;
   const conversations = page.props.conversations;
    const [showNewUserModel , setShowNewUserModel]=useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const {emit} = useEventBus();
    useEffect(()=>{
        conversations.forEach((conv)=>{
            let channel = `message.group.${conv.id}`;
            if(conv.is_user){
                channel = `message.user.${[
                    parseInt(user.id),
                    parseInt(conv.id),
                ].sort((a,b)=>a-b).join("-")}`;
            }
            Echo.private(channel)
            .error((err)=>{
                console.error('err',err);
            })
            .listen("SocketMessage",(e)=>{
                const message = e.message;
                emit('message.created',message);
                if(message.sender_id ===user.id){
                    return;
                }
                emit("newMessageNotification",{
                    user:message.sender,
                    group_id:message.group_id,
                    message:message.message||
                        `Shared ${
                            message.attachments.length === 1 ? "an attachment" :message.attachments.length + "attachments"
                        }`,
                })
            });
            if(conv.is_group){
                Echo.private(`group.deleted.${conv.id}`)
                .listen("GroupDeleted",(e)=>{
                    emit('group.deleted',{id:e.id,name:e.name});
                }).error(e=>{
                    console.error(e);
                })
            }
        })
        return ()=>{
            conversations.forEach((conv)=>{
                let channel = `message.group.${conv.id}`;
                if(conv.is_user){
                    channel = `message.user.${[
                        parseInt(user.id),
                        parseInt(conv.id),
                    ].sort((a,b)=>a-b).join("-")}`;
                }
                Echo.leave(channel);
                if(conv.is_group){
                    Echo.leave(`group.deleted.${conv.id}`)
                }

            })
        }
    },[conversations])
    
    return (
      <>
        <div className="flex flex-col h-screen min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex items-center shrink-0">
                                <Link href="/">
                                    <ApplicationLogo className="block w-auto text-gray-800 fill-current h-9 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Home
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="relative flex ms-3">
                                {user.is_admin && (
                                    <PrimaryButton
                                        onClick = {(e)=>setShowNewUserModel(true)}
                                    >
                                        <UserPlusIcon className='w-5 h-5 mr-2'/>
                                        Add New User
                                    </PrimaryButton>
                                )}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out bg-white border border-transparent rounded-md dark:text-gray-400 dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="flex items-center -me-2 sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 text-gray-400 transition duration-150 ease-in-out rounded-md dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400"
                            >
                                <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {children}
        </div>
        <Toast />
        <NewMessageNotification />
        <NewUserModal show={showNewUserModel} onClose={(e)=>setShowNewUserModel(false)}  />
      </>
    );
}
