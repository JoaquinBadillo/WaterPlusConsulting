{ pkgs, ... }: {
  channel = "stable-23.11";

  packages = [
    pkgs.go
    pkgs.corepack_20
  ];

  env = {};
  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "golang.go"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "run" "dev" "--port" "$PORT"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        pnpm-install = "pnpm install";
      };
      onStart = {};
    };
  };
}
