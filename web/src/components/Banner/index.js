import React from 'react'

import './style.css'

const Banner = ({ isGood , text }) => {
	return <div className={`banner ${isGood ? "good" : "bad"}`}>{text}</div>
}

export default Banner;