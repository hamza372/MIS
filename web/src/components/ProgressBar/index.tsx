import React, { Component } from 'react'
import './style.css'

interface p {
	percentage: number
}

export const ProgressBar = ({ percentage }: p) => <div className="progress-bar">
	<Filler percentage={percentage} />
</div>

export const Filler = ({ percentage }: p) => <div className="filler" style={{ width: `${percentage}%`}}/>