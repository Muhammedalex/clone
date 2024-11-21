import {useState,useEffect} from 'react'
import InputError from '../InputError'
import Modal from '../Modal'
import InputLabel from '../InputLabel'
import TextInput from '../TextInput'
import SecondaryButton from '../SecondaryButton'
import PrimaryButton from '../PrimaryButton'
import { useForm, usePage } from '@inertiajs/react'
import TextAreaInput from './TextAreaInput'
import UserPicker from './UserPicker'
import { useEventBus } from '@/EventBus'

//text area Comp and userpicker


const GroupModal = ({show = false , onClose=()=>{}}) => {
        const page = usePage();
        const conversations = page.props.conversations;
        const { on , emit }= useEventBus();
        const [group , setGroup ] = useState({});

        const {data,setData,processing ,reset,post,put,errors} = useForm({
            id:"",
            name:"",
            description:"",
            user_ids:[],
        });

        const users = conversations.filter((c)=>!c.is_group);
        const createOrUpdateGroup = (e) =>{
            e.preventDefault();

            if(group.id){
                put(route("group.update",group.id),{
                    onSuccess:()=>{
                        closeModal();
                        emit('toast.show',`Group ${data.name} was updated`);
                    },
                });
                return;
            }
            post(route("group.store",group.id),{
                onSuccess:()=>{
                    closeModal();
                    emit('toast.show',`Group Created`);
                },
            });            
            closeModal();
        }

        const closeModal =()=>{
            reset();
            onClose();
        };

        useEffect(()=>{
            return on('GroupModal.show',(group)=>{
                
                setData({
                    name:group.name,
                    description:group.description,
                    user_ids:group.users.filter((u)=>group.owner_id !==u.id).map((u)=>u.id)
                });
                setGroup(group);
            })
        },[on])
        return (
    <div>
        <Modal show={show} onClose={closeModal} >
            <form onSubmit={createOrUpdateGroup} className='p-6 overflow-y-auto'>
                <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
                    {group.id 
                        ? `Edit Group ${group.name}`
                        : "Create New Group"    
                    }
                </h2>
                   <div className='mt-4'>
                   <InputLabel htmlFor="name" value="Name" />
                    <TextInput 
                        id="name"
                        className="block w-full mt-1"
                        value={data.name}
                        disabled={!!group.id}
                        onChange={(e)=>setData("name",e.target.value)}
                    />
                    <InputError className='mt-2' message={errors.name} />
                   </div>
                   <div className='mt-4'>
                   <InputLabel htmlFor="description" value="Description" />
                    <TextAreaInput 
                        id="description"
                        className="block w-full mt-1"
                        value={data.description || ""}
                        onChange={(e)=>setData("description",e.target.value)}
                    />
                    <InputError className='mt-2' message={errors.description} />
                   </div>
                   <div className='mt-4'>
                   <InputLabel htmlFor="description" value="Description" />
                    <UserPicker 
                        value={
                            users.filter(
                                (u)=>group.owner_id !==u.id &&
                                data.user_ids.includes(u.id)
                            ) || []
                        }
                        options={users}
                        onSelect={(users)=>
                            setData(
                                "user_ids",users.map((u)=>u.id)
                            )
                        }
                    />
                    <InputError className='mt-2' message={errors.description} />
                   </div>
                <div className='flex justify-end mt-6'>
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className='ms-3' disabled={processing}>
                        {group.id ? "Update" : "Create"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    </div>
  )
}

export default GroupModal
