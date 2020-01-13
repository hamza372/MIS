import React, { useEffect, useRef, useState } from 'react'

interface P {
	height: number
	width: number
	onImageAccepted: (image_string: string) => any
}

interface S {
	image_string?: string
}

export default class Camera extends React.Component<P, S> {

	stream: Promise<MediaStream>
	video: HTMLVideoElement

	constructor(props: P) {
		super(props);

		this.stream = navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: "environment",
				width: { max: 500 },
				height: { max: 500 },

			}
		})

		this.state = {
			image_string: undefined
		}
	}

	componentDidMount() {
		this.stream.then(stream => this.video.srcObject = stream)
	}

	onCameraClick = () => {
		const canvas = document.createElement('canvas')
		canvas.width = this.props.width;
		canvas.height = this.props.height;

		const ctx = canvas.getContext('2d')
		ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height)

		const data = canvas.toDataURL('image/png')

		this.setState({
			image_string: data
		})

		canvas.remove()
	}

	onImageReject = () => {
		this.setState({
			image_string: undefined
		}, () => {
			this.stream.then(stream => this.video.srcObject = stream)
		})
	}

	onImageAccept = () => {
		this.props.onImageAccepted(this.state.image_string)
	}

	componentWillUnmount() {
		this.stream.then(stream => {
			stream.getTracks().forEach(t => t.stop())
		})
	}

	render() {

		if (this.state.image_string) {
			return <div className="camera">
				<img src={this.state.image_string} />
				<div className="button reject" onClick={this.onImageReject}>Reject Picture</div>
				<div className="button accept" onClick={this.onImageAccept}>Accept Picture</div>
			</div>
		}

		return <div className="camera">
			<video id="viewfinder" ref={x => this.video = x} autoPlay={true} height={this.props.height} width={this.props.width} />

			<div className="button" onClick={this.onCameraClick}>Take Picture</div>
		</div>
	}
}