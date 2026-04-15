import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react'
import { PocaCard as CorePocaCard, type PocaCardOptions } from '@pineple/pocato-core'

export interface PocaCardHandle {
  flip(): void
  wiggle(): void
  reset(): void
}

export interface PocaCardProps {
  type: PocaCardOptions['type']
  baseImage: string
  popupImage?: string
  maskImage?: string
  backImage?: string
  flippable?: boolean
  initialFlipped?: boolean
  customShader?: string
  onFlip?: (flipped: boolean) => void
  onReady?: () => void
  onError?: (error: Error) => void
  style?: CSSProperties
  className?: string
}

export const PocaCard = forwardRef<PocaCardHandle, PocaCardProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<CorePocaCard | null>(null)

    // Create/destroy core instance
    useEffect(() => {
      if (!containerRef.current) return

      const card = new CorePocaCard(containerRef.current, {
        type: props.type,
        baseImage: props.baseImage,
        popupImage: props.popupImage,
        maskImage: props.maskImage,
        backImage: props.backImage,
        flippable: props.flippable,
        initialFlipped: props.initialFlipped,
        customShader: props.customShader,
      })

      cardRef.current = card

      return () => {
        card.destroy()
        cardRef.current = null
      }
    // Re-create only when type changes (major config change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type])

    // Sync image options
    useEffect(() => {
      cardRef.current?.updateOptions({
        baseImage: props.baseImage,
        popupImage: props.popupImage,
        maskImage: props.maskImage,
      })
    }, [props.baseImage, props.popupImage, props.maskImage])

    // Sync custom shader
    useEffect(() => {
      if (props.customShader) {
        cardRef.current?.updateOptions({ customShader: props.customShader })
      }
    }, [props.customShader])

    // Bind events
    useEffect(() => {
      const card = cardRef.current
      if (!card) return

      const onFlip = props.onFlip
      const onReady = props.onReady
      const onError = props.onError

      if (onFlip) card.on('flip', onFlip)
      if (onReady) card.on('ready', onReady)
      if (onError) card.on('error', onError)

      return () => {
        if (onFlip) card.off('flip', onFlip)
        if (onReady) card.off('ready', onReady)
        if (onError) card.off('error', onError)
      }
    }, [props.onFlip, props.onReady, props.onError])

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      flip: () => cardRef.current?.flip(),
      wiggle: () => cardRef.current?.wiggle(),
      reset: () => cardRef.current?.reset(),
    }))

    return (
      <div
        ref={containerRef}
        style={props.style}
        className={props.className}
      />
    )
  },
)

PocaCard.displayName = 'PocaCard'
