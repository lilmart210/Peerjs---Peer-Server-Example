import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import {Peer} from 'peerjs';



//const url = '192.168.0.43';
const url = '136.176.37.157';
const port = 8765;

type peerprops = {
  open? : Function,
  called? : Function
}

function usePeer(props : peerprops){
  const [apeer,setPeer] = useState<Peer | null>(null);

  useEffect(()=>{
    const p = new Peer({
      host : url,
      port : port,
      path : 'peer',
      secure : true
      
    })
    if(props.open) p.on('open',(id)=>props.open && props.open(id))

    setPeer(p);

    return()=>{
      if(apeer) apeer.destroy();
    }

  },[])
  
  return apeer;

}

type myVideo = {
  stream? : MediaStream,
  mute? : boolean
}

function Video(props : myVideo){
  const aref = useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const astream = props.stream;
    const avid = aref.current;
    if(astream == undefined || avid == undefined) return;

    avid.srcObject = astream;

  },[props.stream]);

  return <video muted={props.mute} ref={aref} autoPlay>

  </video>
}

function App() {
  const [count, setCount] = useState(0)

  const [otherstrm,setOtherStream] = useState<any>(null);
  const [mystrm,setMyStream] = useState<any>(null);

  const [mid,setid] = useState<any>();
  const [pid,setpid] = useState<any>();
  const inref = useRef<HTMLInputElement>(null);
  const mypeer = usePeer({
    open : setid,
  });
  
  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({audio : true, video : true})
    .then((astream)=>{
      setMyStream(astream);
    })
    .catch(e=>console.error(e));

  },[])

  useEffect(()=>{
    if(pid == undefined || mypeer == undefined) return;

    const call = mypeer.call(pid,mystrm);
    call.on('stream',(astrm)=>{
      setOtherStream(astrm);
    })

  },[pid])

  useEffect(()=>{
    if(!mypeer) return;

    mypeer.addListener('call',(acall)=>{ 
      acall.answer(mystrm);

      acall.on('stream',(astrm)=>{
        setOtherStream(astrm);
      })

      
    })

    return ()=>{
      mypeer.removeListener('call');
    }
    
  },[mypeer,mystrm])


//<Video stream={mystrm} mute={true}/>
  return (
    <div className='PeerContainer'>
      <Video stream={mystrm} mute={true}></Video>
      <Video stream={otherstrm}/>

      <label className='id'>{mid}</label>

      <input ref={inref}></input>
      <button onClick={()=>{
        setpid(inref.current?.value);
      }}></button>
    </div>
  )
}

export default App
