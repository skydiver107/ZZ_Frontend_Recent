import React from "react";
import PropTypes from "prop-types";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMediaQuery } from 'react-responsive'

export default function WalletButton({
  className,
  hasBorder,
  disabled,
  variant = "white",
  text,
  children,
  clickHandler,
  ...rest
}) {
  const isMobile = useMediaQuery({
    query: '(max-width: 1024px)'
  })

  return (<ConnectButton.Custom>
    {({
      account,
      chain,
      openAccountModal,
      openChainModal,
      openConnectModal,
      mounted,
    }) => {
      return (
        <div
          {...(!mounted && {
            'aria-hidden': true,
            'style': {
              opacity: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            },
          })}
        >
          {(() => {
            if (!mounted || !account || !chain) {
              return (
                <button onClick={openConnectModal} type="button">
                  Connect Wallet
                </button>
              );
            }

            if (chain.unsupported) {
              return (
                <button onClick={openChainModal} type="button">
                  Wrong network
                </button>
              );
            }

            return (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={openChainModal}
                  style={{ display: 'flex', alignItems: 'center' }}
                  type="button"
                >
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                >
                  {account.displayName}
                </button>
              </div>
            );
          })()}
        </div>
      );
    }}
  </ConnectButton.Custom >
  );
}

ConnectButton.prototype = {
  variant: PropTypes.oneOf(["white , blue", "purple"]),
};