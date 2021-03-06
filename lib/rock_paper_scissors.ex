defmodule RockPaperScissors do
  use Application
  alias RockPaperScissors.GameSupervisor
  alias RockPaperScissors.GameRegistry
  alias RockPaperScissors.GameDispatcher
  alias RockPaperScissors.GameDispatcherManager
  alias RockPaperScissors.GameChannelBridge
  alias RockPaperScissors.GameLogger

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      # Start the endpoint when the application starts
      supervisor(RockPaperScissors.Endpoint, []),
      # Start the Ecto repository
      worker(RockPaperScissors.Repo, []),
      worker(GameRegistry, []),
      worker(GenEvent, [[name: GameDispatcher]]),
      worker(GameDispatcherManager, [GameDispatcher, GameLogger], id: GameLogger),
      worker(GameDispatcherManager, [GameDispatcher, GameChannelBridge], id: GameChannelBridge),
      supervisor(GameSupervisor, []),
      # Here you could define other workers and supervisors as children
      # worker(RockPaperScissors.Worker, [arg1, arg2, arg3]),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: RockPaperScissors.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    RockPaperScissors.Endpoint.config_change(changed, removed)
    :ok
  end
end
