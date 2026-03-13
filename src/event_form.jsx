import React, { useState,useRef } from 'react';

export default function Event_Form({ title, setTitle,style,setStyle, location, setLocation,date,setDate,rsvp,setRSVP,otherDetails,setOtherDetails,time,setTime,selectedImage,setSelectedImage,backgroundImageGenPrompt,setBackgroundImageGenPrompt }) {

	/*
        const [date,setDate] = useState(new Date());
        const [title,setTitle] = useState("");
        const [rsvp,setRSVP] = useState("");
        const [location,setLocation] = useState("");
        const [time,setTime] = useState('7:30');
	const [selectedImage,setSelectedImage]=useState(null);
	*/
	const fileInputRef=useRef(null);
	const styles=["Corporate" , "Minimal", "Modern", "Party"];

	const formattedDate = (date &&  !isNaN(new Date(date)) )? new Date(date).toISOString().slice(0, 10) : '';

	const handleDateChange=(event)=>
	{
		const dateString =event.target.value;
		const formatted = new Date(dateString +'T00:00:00');
		setDate(formatted);
	}

	const handleTitleChange=(event)=>
	{
		setTitle(event.target.value);
	}
	const handleTimeChange=(event)=>
	{
		setTime(event.target.value);
	}
	const handleRSVPChange=(event)=>
	{
		setRSVP(event.target.value);
	}
	const handleLocationChange=(event)=>
	{
		setLocation(event.target.value);
	}
	const handleFileChange=(event)=>
	{
		const file= event.target.files[0]
		if (file && file.type.substring(0,5) === "image")

			setSelectedImage(file);
		else
			setSelectedImage(null);
	}
	const handleButtonClick=()=>
	{
		fileInputRef.current?.click();
	}

	return (
          <div>
          <div className="form-container">
		<div className="form-event-details">                   
			<p style={{fontSize:'18px',color:'black' }}>Enter Event Details </p>
		</div> 

		<div className= "form-group">

			
			<label htmlFor="title">Title:</label>
			<input
			  	id="title"	
				type="text"
				value={title}
				onChange={handleTitleChange} />
		</div>
		<div className= "form-group">
		<label htmlFor="Style">Select Style:</label>
		<select
			value ={style}
			onChange={(e)=> setStyle(e.target.value)}
                                        >
			{styles.map (item=>(
                                                <option key={item} value={item}>
                                                {item}
                                                </option>))}
                                </select>


		</div>




		<div className= "form-group">
			<label htmlFor="date">Select Date:</label>
			<input
			id="date"
			type="date"
			value={formattedDate}
			onChange={handleDateChange}
		      />
		 </div>
		<div className= "form-group">
			<label htmlFor="alarm-time">Alarm clock:</label>
			<input 	
				id="alarm-time"
				type="time"
				value={time}
				onChange={handleTimeChange}
			/>
		 </div>
		<div className= "form-group">
			<label htmlFor="location">Location:</label>
			<input 	
				id="location"
				type="text"
				value={location}
				onChange={handleLocationChange} />
		 </div>
		<div className= "form-group">
			<label htmlFor="rsvp">RSVP:</label>
			<input 	
				id="rsvp"
				type="text"
				value={rsvp}
				onChange={handleRSVPChange}

			/>
		 </div>
                 
		<div className= "form-group">
			<label htmlFor="other-details">Other Details:</label>	
				<textarea
                                        id="other-details"
                                        value={otherDetails}
                                        onChange={(e) => setOtherDetails(e.target.value)}
                                        maxlength={50}
                                        placeholder="Enter other details eg. notes,speakers.Keep your input to a max 50 characters"
                                        rows={7}
                                        style={{
                                        width: '100%',
                                        padding: '10px',
                                        boxSizing: 'border-box', // Ensures padding doesn't affect width
                                        resize: 'vertical' // Allows user to resize vertically
                                        }}
                                />

		</div>
		<div className= "form-group-input">
			<div className="form-sub-header">                   
				<p style={{color:'black'}}>Upload Image or Enter Prompt to generate Image</p>
			</div> 
                        
			<div className="form-sub-content1">                   
			<input
 				type="file"
				accept="image/*"
				ref={fileInputRef}
				onChange={handleFileChange}
				style ={{display:'none'}}
			/>
			<button type="button" onClick={handleButtonClick}>
				{selectedImage ?"Change Image":"Upload Image"}
			</button>
			{selectedImage && (
				<div>
				  <h2>Image Preview:</h2>
				  <img
				    alt="not found"
				    width={"250px"}
				    src={URL.createObjectURL(selectedImage)} // Create a temporary URL for preview
				  />
				  <br />
				  <button type="button" onClick={() => setSelectedImage(null)}>Remove Image</button>
				</div>
			      )}
			<p style={{fontSize:'18px'}} >OR</p>

			<textarea
                                        value={backgroundImageGenPrompt}
                                        onChange={(e) => setBackgroundImageGenPrompt(e.target.value)}
 					maxlength={500}
                                        placeholder="Enter prompt to generate a background Image.Ask AWS a question .Keep your prompt to a maximum of 500 characters"
                                        rows={7}
                                        style={{
                                        width: '100%',
                                        padding: '10px',
                                        boxSizing: 'border-box', // Ensures padding doesn't affect width
                                        resize: 'vertical' // Allows user to resize vertically
                                        }}
                                />
			
			</div>

	     {/*form-group-input*/}
	    </div> 
	    {/*form-container*/}
	</div> 
    {/*main*/}
    </div> 
	);

}
