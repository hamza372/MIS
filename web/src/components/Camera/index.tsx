import React from 'react'

import './style.css'

interface P {
	height: number
	width: number
	onImageAccepted: (image_string: string) => any
	format: "jpeg" | "png"
	onClose: () => void
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
				width: { max: props.width, ideal: props.width },
				height: { max: props.height, ideal: props.height },

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

		const data = canvas.toDataURL(`image/${this.props.format}`)

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
		// When the modal is hidden
		document.body.style.position = ''
	}

	componentWillUnmount() {
		this.stream.then(stream => {
			stream.getTracks().forEach(t => t.stop())
		})
	}

	render() {

		if (this.state.image_string) {
			return <div className="camera">
				<div className="title">Camera</div>
				<img src={this.state.image_string} alt="camera-result" />
				<div className="row">
					<div className="button red" onClick={this.onImageReject}>✕</div>
					<div className="button green" onClick={this.onImageAccept}>✓</div>
				</div>
			</div >
		}

		return <div className="camera">
			<div className="close button red" onClick={this.props.onClose}>✕</div>

			<div className="title">Camera</div>
			<video id="viewfinder" ref={x => this.video = x} autoPlay={true} height={this.props.height} width={this.props.width} />

			<div className="button blue" onClick={this.onCameraClick}>Take Picture</div>
		</div>
	}
}