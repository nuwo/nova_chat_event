import React ,{ useEffect } from "react";

import { useState,useRef } from 'react'
import  backgroundEvent  from './assets/event_bg.mp4';
import EventFields from './event_form';
import { novaStyleInstructions }  from "./NovaAssistantInstructions";
import html2canvas from 'html2canvas';
export default function Nova_chat_App() {


	const [prompt, setPrompt] = useState("");
	const [response, setResponse] = useState("");
	const [error, setError] = useState(null);
	const [history,setHistory] = useState([]);
	const [loading, setLoading] = useState(false);

	const [API,setAPI]=useState(null);
	//const [DEFAULT_MODEL,setDEFAULT_MODEL]=useState("nova-micro");
	const [DEFAULT_MODEL,setDEFAULT_MODEL]=useState("nova-canvas");
	const [MODELS,setMODELS]=useState([]);
	// let API  = null;
	// let DEFAULT_MODEL="nova-micro"; 
	// let MODELS= [];

	const [date,setDate] = useState(new Date());
        const [title,setTitle] = useState("");
        const [rsvp,setRSVP] = useState("");
        const [location,setLocation] = useState("");
        const [time,setTime] = useState('7:30');
        const [selectedImage,setSelectedImage]=useState(null);
        const [otherDetails,setOtherDetails]=useState("");

	const [selectedModel,setSelectedModel] = useState(DEFAULT_MODEL);

	const [generatedImage,setGeneratedImage]=useState(null);
	const [downloadUrl,setDownloadUrl]=useState("");
	const posterRef=useRef(null);

	const [style,setStyle]=useState("Corporate");
	const styles=["Corporate" , "Minimal", "Modern", "Party"];

	const [backgroundImageGenPrompt,setBackgroundImageGenPrompt]=useState("");


	useEffect(()=>{
		async function loadConfig()
		{
			try {
				const config_res = await fetch('/config.json', {cache:'no-store' }); 
				if (!config_res.ok) throw new Error('config.json not found');
					const cfg= await config_res.json();

					setAPI( cfg.CHAT_API);
					setDEFAULT_MODEL ( cfg.DEFAULT_MODEL || DEFAULT_MODEL);
					//setMODELS( Array.isArray(cfg.MODELS) ? cfg.MODELS : [{ key: "nova-micro", label: "Nova Micro" }]);
					setMODELS( Array.isArray(cfg.MODELS) ? cfg.MODELS : [{ key: "nova-canvas", label: "Nova Canvas" }]);


					for ( const m of MODELS){

						if( m.key === DEFAULT_MODEL)
							setSelectedModel(m.key)

					}
				}
				catch(err)
				{
					console.log("laod config error",err);
					setError(` ${err?.message||'Error loading config'}`);
				}

			}
			loadConfig();
		},[]);



	const toBase64 =(file)=>

	new Promise((resolve,reject)=>{

			const reader=new FileReader();
			reader.readAsDataURL(file);
			reader.onload=()=> resolve(reader.result);
			reader.onerror=error=> reject(error);


	       });	

	
	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResponse(`role:'user',text:${prompt}`);
		if (!API) {
			setError("API not loaded yet. Please wait.");
			return; // stop submit
		}

		try{
			const res = await fetch(API, {

				method: "POST",
				headers: {
				"Content-Type": "application/json"
				},
				body: JSON.stringify({
				      prompt,
				      history,
				      model:selectedModel
			      })
			});



			if (!res.ok)
			{
				const errText=await res.text().catch(()=> '');
				setError(` ${res.status}:${errText||'Request failed'}`);
				return;
			}

			const data = await res.json();
			const text = data.text || "no response";
			setHistory(history=>[...history,{role:'user', text:prompt},{role:'assistant',text}]);
			const CAP= 12;
			if( history.length > CAP) history.splice(0,(history.length-CAP));


		} 
		catch(err){

		setError(`Network Error : ${err?.message || err}`);

		}

		finally{
			setLoading(false);
		}      
	}


	const captureAndDownload= async() =>{
		if (posterRef.current){

			const canvas = await html2canvas(posterRef.current,{useCORS:true , scale:2,backgroundColor: null});


			canvas.toBlob((blob)=>{
				const downloadedUrl=URL.createObjectURL(blob);
				setDownloadUrl(downloadedUrl);
                        },'image/png');
		}

	};



	function validateAndResizeImage(file) {
	  return new Promise((resolve, reject) => {
	 if (!file) {
	      resolve(null);   
	      return;
	    }

	    const img = new Image();
	    const reader = new FileReader();

	    reader.onload = function(e) {
	      img.src = e.target.result;
	    };

	    img.onload = function() {

	      let width = img.width;
	      let height = img.height;

	      // Ensure divisible by 16
	      let newWidth = Math.min(Math.max(320, Math.floor(width / 16) * 16), 4096);
	      let newHeight = Math.min(Math.max(320, Math.floor(height / 16) * 16), 4096);

	      // Aspect ratio check
	      let aspectRatio = newWidth / newHeight;

	      if (aspectRatio < 0.25) {
		newWidth = Math.floor(newHeight * 0.25);
	      } 
	      else if (aspectRatio > 4.0) {
		newHeight = Math.floor(newWidth / 4);
	      }

	      // Canvas resize
	      const canvas = document.createElement("canvas");
	      canvas.width = newWidth;
	      canvas.height = newHeight;

	      const ctx = canvas.getContext("2d");
	      ctx.drawImage(img, 0, 0, newWidth, newHeight);

	      const base64 = canvas.toDataURL("image/png").split(",")[1];

	      resolve(base64);
	    };
	   img.onerror = (error) => reject(error);
	   reader.onerror = (error) => reject(error);
  
	    reader.readAsDataURL(file);

	  });
	}

	function base64Blob(base64Data,contentType) {
		const byteCharacters = atob(base64Data);
		const byteArray = new Array( byteCharacters.length);


		for(let i=0;i<byteCharacters.length;i++){
			byteArray[i]=byteCharacters.charCodeAt(i);
		}
		const blobArray = new Uint8Array(byteArray);
		return new Blob([blobArray],{type:contentType});
	}

	async function handleFieldsSubmit(e){
		e.preventDefault();

		setLoading(true);
		setError(null);

		console.log("Image file:", selectedImage);
		console.log("Title :", title);
		console.log("Date:", date);
		console.log("Style:", style);
		console.log("Time :", time);
		console.log("Location:",location);
		console.log(" RSVP:", rsvp);
		const prompt = `
		${novaStyleInstructions}

		${backgroundImageGenPrompt}

		Event Details:
		Title: ${title}
                Style: ${style}
		Location: ${location}
		Date: ${date}
		Time: ${time}
		RSVP:${rsvp}
		Other Details:${otherDetails}
		`;

		console.log("Given prompt and instructions:",prompt);

		//conditioned ,resized and convert to base64 on selectedImage
	        const conditioned_image= await validateAndResizeImage(selectedImage);
        

		//const base64Image = await toBase64(conditionedImage);

		console.log("Selected Model:",selectedModel);

		const payload = {
		  inputText: prompt
		};

		try{
			const res = await fetch(API, {
                
                                method: "POST",
                                headers: {
                                "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                      prompt:prompt,
				      image: conditioned_image ? conditioned_image : "",     	
                                      model:selectedModel
                              })
                        });
                
                
                
                        if (!res.ok)
                        {
                                const errText=await res.text().catch(()=> '');
                                setError(` ${res.status}:${errText||'Request failed'}`);
                                return;
                        }

			const responseGeneratedImage = await res.json();

			let receivedImageData ="";
			if (responseGeneratedImage.success )
				receivedImageData = responseGeneratedImage["image"];
				
			console.log(receivedImageData.slice(0,100));
			console.log(receivedImageData.length);

		        const img_data =`data:image/png;base64,${receivedImageData}`;		

			setGeneratedImage(img_data);			

			//const imageBlob=base64Blob(receivedImageData,'image/png');
		        //const downloadedUrl =URL.createObjectURL(imageBlob);
					
			//setDownloadUrl(downloadedUrl);
		}
		catch(e){
			setError(e?e.message : 'request failed');


		}
		finally{
			setLoading(false);
		}


        }
	return (
           <div>
		<div className="videoContainer">

		   <video autoPlay loop muted playsInline id ="backgroundVideo">
		     <source src={backgroundEvent} type= "video/mp4"/>
		   </video>
		</div>

		<div className="chatContainer">
			{/*
			<form onSubmit={handleSubmit}>
				<div className="form-header">
					<h2>Amazon Nova Chatbot</h2>
				</div>
				<div className="form-body">
					<h2>Amazon Nova Chatbot</h2>
					<p>This Assistant answers questions only </p>
				</div>
				<div className="form-body">
				<select
					value ={selectedModel}
					onChange={(e)=> setSelectedModel(e.target.value)}
					>
					{ MODELS.map (m=>(
						<option key={m.key} value={m.key}>
						{m.label}
						</option>))}
				</select>
				</div>
				<div className="form-body">
				<textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Enter prompt .Ask AWS a question"
					rows={7}
					style={{
					width: '100%',
				        padding: '10px',
				        boxSizing: 'border-box', // Ensures padding doesn't affect width
				        resize: 'vertical' // Allows user to resize vertically
					}}
				/>
				</div>
				<div className="form-body">
					<div>
					{history.map((msg, i) => (
						<div key={i} 
						style={{
						textAlign: msg.role === "user" ? "right" : "left", color : msg.role === "user" ? "white" :" green",
						margin: "5px 0"
						}}
						>
						<strong>{msg.role==='user'? "User:" : "Assistant:"}</strong> {msg.text}</div>
						))} 
					</div>
						<button type="submit" disabled={loading}>
						{loading ? "Thinking..." : "Send"}
						</button>
				</div>


			</form>
				{error && <p style={{ color: "red" }}>{error}</p>}
				{response && <p><strong>AI:</strong> {response}</p>}
			*/}
 			<form onSubmit={handleFieldsSubmit}>
				<EventFields
				title={title}
				setTitle={setTitle}
                                style = {style}
                                setStyle = {setStyle}
				date={date}
				setDate={setDate}
				location={location}
				setLocation={setLocation}
				rsvp={rsvp}
				setRSVP={setRSVP}
				otherDetails={otherDetails}
				setOtherDetails={setOtherDetails}
				time={time}
				setTime={setTime}
				selectedImage={selectedImage}
				setSelectedImage={setSelectedImage}
				backgroundImageGenPrompt={backgroundImageGenPrompt}
				setBackgroundImageGenPrompt={setBackgroundImageGenPrompt}
				      />
			<div className='form-button'>
				<button type="submit">Submit Event</button>
			</div>
			<div className='form-Image'>

			{generatedImage && <h3 > AI Generated Image </h3>}
			{generatedImage && (<div> <img src={generatedImage} alt="Generated Event Image" width="300"/>
						</div>) }
			
			</div>

			{generatedImage && (<div className= 'event-poster' ref= {posterRef} style={{backgroundImage: `url(${generatedImage})`,
										backgroundSize: 'cover',
                                                                                backgroundPosition: 'center',
										backgroundRepeat: 'no-repeat',
										width: '100%',
                                                                                height: '100vh',
                                                                                display: 'flex',
                                                                                alignItem: 'center',
                                                                                justifyContent:'center',
										color:'black',
										}}>


			<div className='event-details' style={{ padding:'15px', borderRadius:'10px',color:'black' }}>
			<p style={{fontSize:'18px',fontWeight:'bold'}}>{title}</p>
			<p style = {{fontSize:'12px',fontStyle:'italic'}}><strong>Date:</strong>{`${date}`} | <strong> Time :</strong>{`${time}`}|<strong> Location:</strong>{`${location}`}</p>
			<p style={{fontSize:'12px'}}><strong >RSVP:</strong>{`${rsvp}`}</p>
			{otherDetails && <p style={{fontSize:'12px'}}><strong>Details:</strong> {`${otherDetails}`}</p>}
		        	
			</div>


			</div>)}

			{generatedImage && <button onClick={captureAndDownload}>
					 Create Download Link
					</button>}

	         	{downloadUrl &&( <a href={downloadUrl} download='event-poster.png' className='download-button '>Download Image </a>)}

			</form>

		</div>
          </div>
		);



}
