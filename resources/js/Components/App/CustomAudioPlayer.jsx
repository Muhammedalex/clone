import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid'
import {useRef , useState} from 'react'

const CustomAudioPlayer = ({file, showVolume = true}) => {
    const audioRef = useRef(null);
    const [isPlaying , setIsplaying] = useState(false);
    const [volume , setVolume] = useState(1);
    const [duration , setDuration] = useState(1);
    const [currentTime , setCurrentTime] = useState(1);

    const togglePlayPause = () =>{
        const audio = audioRef.current;
        if(isPlaying){
            audio.pause();
        }else {
            setDuration(audio.duration);
            audio.play();
        }
        setIsplaying(!isPlaying);
    }
    const handleVolume =(e)=>{
        const volume = e.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    }

    const handleTime = (e) =>{
        const audio = audioRef.current;
        setDuration(audio.duration);
        setCurrentTime(e.target.currentTime);
    }

    const handleLoadedMetadata = (e) =>{
        setDuration(e.target.duration);
    };

    const handleSeekChange =(e)=>{
        const time =e.target.value;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  return (
    <div className='flex items-center w-full gap-2 px-3 py-2 rounded-md bg-slate-800'>
        <audio
            ref={audioRef}
            src={file.url}
            controls
            onTimeUpdate={handleTime}
            onLoadedMetadata={handleLoadedMetadata}
            className='hidden'
        />
        
        <button onClick={togglePlayPause}>
            {isPlaying && <PauseCircleIcon className='w-6 text-gray-400' />}
            {!isPlaying && <PlayCircleIcon className='w-6 text-gray-400' />}
        </button>
        {showVolume && (
            <input type='range' onChange={handleVolume} min="0" max="1" step="0.01" value={volume} />
        )}
        <input
            type='range'
            className='flex-1'
            max={duration}
            min="0"
            value={currentTime}
            onChange={handleSeekChange}
        />
    </div>
  )
}

export default CustomAudioPlayer
