import React, { useCallback, useMemo } from 'react'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { isCucumberProvider, isDapperProvider } from 'decentraland-dapps/dist/lib/eth'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { LoginModal, LoginModalOptionType } from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import { isElectron } from '../../integration/desktop'
import { EthConnectAdvice } from './EthConnectAdvice'

export interface WalletSelectorProps {
  open: boolean
  loading: boolean
  canceling?: boolean
  provider?: ProviderType
  availableProviders?: ProviderType[]
  onLogin?: (provider: ProviderType | null) => void
  onCancelLogin?: () => void
  onClose?: () => void
}

export const EthWalletSelector: React.FC<WalletSelectorProps> = React.memo(({
  open,
  loading,
  canceling,
  provider,
  availableProviders,
  onLogin,
  onCancelLogin,
  onClose,
}) => {
  const anchor = useMemo(() => {
    const a = document.createElement('a')
    a.target = '_blank'
    a.rel = 'noreferrer noopener'
    a.href = 'https://metamask.io/download.html'
    return a
  }, [])

  const browserWallet = useMemo<LoginModalOptionType | null>(() => {
    if (availableProviders && availableProviders.length > 0) {
      const hasWallet = availableProviders.includes(ProviderType.INJECTED)
      if (hasWallet) {
        return isCucumberProvider() ? LoginModalOptionType.SAMSUNG :
          isDapperProvider() ? LoginModalOptionType.DAPPER :
          LoginModalOptionType.METAMASK
      }
    }

    return null
  }, [ availableProviders ])

  const handleLoginWalletConnect = useCallback(() => onLogin && onLogin(ProviderType.WALLET_CONNECT), [ onLogin ])
  const handleLoginFortmatic = useCallback(() => onLogin && onLogin(ProviderType.FORTMATIC), [ onLogin ])
  const handleLoginInjected = useCallback(() => {
    if (browserWallet && onLogin) {
      onLogin(ProviderType.INJECTED)
    } else {
      anchor.click()
    }
  }, [ onLogin,browserWallet, anchor ])

  return <LoginModal
    open={open}
    onClose={onClose}
    i18n={{
      title: 'Connect your wallet',
      error: '',
      subtitle: ''
    }}
  >
      {!isElectron() && <LoginModal.Option type={browserWallet || LoginModalOptionType.METAMASK} onClick={handleLoginInjected} />}
      <LoginModal.Option type={LoginModalOptionType.FORTMATIC} onClick={handleLoginFortmatic} />
      <LoginModal.Option type={LoginModalOptionType.WALLET_CONNECT} onClick={handleLoginWalletConnect}  />
      <small className="message">Trezor and smart contract wallets like Dapper, Argent or Gnosis safe, do not work with Polygon. Read more about the Trezor support status
        {' '}
        <a
          href="https://github.com/trezor/trezor-firmware/pull/1568"
          target="_blank"
          rel="noopener noreferrer">
          {'here'}
        </a>.
      </small>
      {loading && <div className="loader-background">
        <Loader active={loading} provider={provider} size="massive" />
        <EthConnectAdvice provider={provider} style={{ marginTop: '27px'}} />
        <div style={{ marginTop: '22px'}}>- or -</div>
        <Button onClick={onCancelLogin} loading={canceling} style={{ marginTop: '28px'}}>cancel login</Button>
      </div>}
    </LoginModal>
})
