import {useEffect} from 'react'
import InputError from '../InputError'
import Modal from '../Modal'
import InputLabel from '../InputLabel'
import TextInput from '../TextInput'
import SecondaryButton from '../SecondaryButton'
import PrimaryButton from '../PrimaryButton'
import { useForm } from '@inertiajs/react'
import TextAreaInput from './TextAreaInput'
import UserPicker from './UserPicker'
import { useEventBus } from '@/EventBus'
import Checkbox from '../Checkbox'

//text area Comp and userpicker


const NewUserModal = ({show = false , onClose=()=>{}}) => {
        const {  emit }= useEventBus();

        const {data,setData,processing ,reset,post,errors} = useForm({
            name:"",
            email:"",
            is_admin:false,
        });

        const submit = (e) =>{
            e.preventDefault();
            post(route("user.store"),{
                onSuccess:()=>{
                    closeModal();
                    emit('toast.show',`User ${data.name} was Created`);
                },
            });            
            closeModal();
        }

        const closeModal =()=>{
            reset();
            onClose();
        };

        return (
    <div>
        <Modal show={show} onClose={closeModal} >
            <form onSubmit={submit} className='p-6 overflow-y-auto'>
                <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
                    Create New User
                </h2>
                   <div className='mt-4'>
                   <InputLabel htmlFor="name" value="Name" />
                    <TextInput 
                        id="name"
                        className="block w-full mt-1"
                        value={data.name}
                        required
                        isFocused
                        onChange={(e)=>setData("name",e.target.value)}
                    />
                    <InputError className='mt-2' message={errors.name} />
                   </div>
                   <div className='mt-4'>
                   <InputLabel htmlFor="email" value="Email" />
                    <TextInput 
                        id="email"
                        required
                        className="block w-full mt-1"
                        value={data.email || ""}
                        onChange={(e)=>setData("email",e.target.value)}
                    />
                    <InputError className='mt-2' message={errors.email} />
                   </div>
                   <div className='mt-4'>
                   <label className="flex items-center">
                        <Checkbox
                            name="is_admin"
                            checked={data.is_admin}
                            onChange={(e) => setData('is_admin', e.target.checked)}
                        />
                        <span className="text-sm text-gray-600 ms-2 dark:text-gray-400">Admin User</span>
                    </label>
                   </div>
                <div className='flex justify-end mt-6'>
                    <SecondaryButton onClick={closeModal}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className='ms-3' disabled={processing}>
                       Create
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    </div>
  )
}

export default NewUserModal
