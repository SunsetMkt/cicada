import { Command } from 'commander';
import path from 'path';
import server from './server';
import exitWithMessage from './utils/exit_with_message';
import definition from './definition';

const program = new Command()
  .name('cicada')
  .description('知了, 支持多用户的开源音乐服务.')
  .version(definition.VERSION);

program
  .command('start')
  .description('start cicada server')
  .option('-c, --config <config>', 'specify config file')
  .option('--data <data>', "override config's data")
  .option('--port <port>', "override config's port")
  .action(
    async ({
      config,
      data,
      port,
    }: {
      config?: string;
      data?: string;
      port?: string;
    }) => {
      if (!config) {
        return exitWithMessage('请通过「-c/--config」指定配置文件');
      }

      const portNumber = port ? Number(port) : undefined;
      server.start({
        configFilePath: path.isAbsolute(config)
          ? config
          : path.resolve(process.cwd(), config),
        data,
        port: portNumber,
      });
    },
  );

program
  .command('data-update')
  .description('update data to fit current version')
  .option('-c, --config <config>', 'specify config file')
  .action(async ({ config }: { config?: string }) => {
    if (!config) {
      return exitWithMessage('请通过「--config」指定配置文件');
    }
    server.start(
      path.isAbsolute(config) ? config : path.resolve(process.cwd(), config),
    );
  });

program.parse();
