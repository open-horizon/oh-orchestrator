const { SERVER_TYPE, LOG_TYPE, saveLog } = require('../../../models/anaxSocketModel');

const converContainerResponse = (nodeId, containerResponse, correlationId) => {
  const convertedResponse = {
    Id: '65ae19d08447d19ddff4afed84972289259a6c439761409b8d9933a376206df9',
    Names: [
      '/anax_bc8ebd2abf839833',
    ],
    Image: 'openhorizon/amd64_anax:latest',
    ImageID: 'sha256:00ff8ac15bf5691d9d776704d7f7fe48fa80657c85ec4f4d4ae474ef070e2306',
    Command: '/root/anax.service start',
    Created: 1606249608,
    Ports: [
      {
        IP: '127.0.0.1',
        PrivatePort: 8510,
        PublicPort: 8200,
        Type: 'tcp',
      },
    ],
    Labels: {
      architecture: 'x86_64',
      'authoritative-source-url': 'registry.access.redhat.com',
      'build-date': '2019-09-16T12:28:09.399802',
      'com.redhat.build-host': 'cpt-1002.osbs.prod.upshift.rdu2.redhat.com',
      'com.redhat.component': 'ubi8-minimal-container',
      'com.redhat.license_terms': 'https://www.redhat.com/en/about/red-hat-end-user-license-agreements#UBI',
      description: 'A container which holds the edge node agent, to be used in environments where there is no operating system package that can install the agent natively.',
      'distribution-scope': 'public',
      'io.k8s.description': 'The Universal Base Image Minimal is a stripped down image that uses microdnf as a package manage.',
      'io.k8s.display-name': 'Red Hat Universal Base Image 8 Minimal',
      'io.openshift.expose-services': '',
      'io.openshift.tags': 'minimal rhel8',
      maintainer: 'Red Hat, Inc.',
      name: 'amd64_anax',
      release: '69987ccd',
      summary: 'The agent in a general purpose container.',
      url: 'https://access.redhat.com/containers/#/registry.access.redhat.com/ubi8-minimal/images/8.0-213',
      'vcs-ref': 'cd4b5a1918e11cd510080cc6ee5496bc730f16cf',
      'vcs-type': 'git',
      vendor: 'IBM',
      version: '2.27.0-173.202010230012.69987ccd',
    },
    State: 'running',
    Status: 'Up 2 minutes',
    HostConfig: {
      NetworkMode: 'default',
    },
    NetworkSettings: {
      Networks: {
        bridge: {
          IPAMConfig: null,
          Links: null,
          Aliases: null,
          NetworkID: '5be4f9efababc8cf37c923ec99fb21a057abcae25162ca6775566b270d874d1f',
          EndpointID: 'db485e0634f5b79e65736a9623a7d8375b4b02099d4a71939c45d134dd84f5e8',
          Gateway: '172.17.0.1',
          IPAddress: '172.17.0.3',
          IPPrefixLen: 16,
          IPv6Gateway: '',
          GlobalIPv6Address: '',
          GlobalIPv6PrefixLen: 0,
          MacAddress: '02:42:ac:11:00:03',
          DriverOpts: null,
        },
      },
    },
    Mounts: [
      {
        Type: 'bind',
        Source: '/var/tmp/oh/sockets/ohorchestrator_bc8ebd2abf8398338c9f8a64cc6ffb14167601a684c953f3aac39c1d.sock',
        Destination: '/var/run/docker.sock',
        Mode: '',
        RW: true,
        Propagation: 'rprivate',
      },
      {
        Type: 'bind',
        Source: '/var/tmp/oh/storage/bc8ebd2abf839833',
        Destination: '/var/tmp/horizon/anax_bc8ebd2abf839833',
        Mode: '',
        RW: true,
        Propagation: 'rprivate',
      },
      {
        Type: 'bind',
        Source: '/etc/default/horizon',
        Destination: '/etc/default/horizon',
        Mode: 'ro',
        RW: false,
        Propagation: 'rprivate',
      },
      {
        Type: 'volume',
        Name: 'anax_bc8ebd2abf839833_etc',
        Source: '/var/lib/docker/volumes/anax_bc8ebd2abf839833_etc/_data',
        Destination: '/etc/horizon',
        Driver: 'local',
        Mode: 'z',
        RW: true,
        Propagation: '',
      },
      {
        Type: 'volume',
        Name: 'anax_bc8ebd2abf839833_var',
        Source: '/var/lib/docker/volumes/anax_bc8ebd2abf839833_var/_data',
        Destination: '/var/horizon',
        Driver: 'local',
        Mode: 'z',
        RW: true,
        Propagation: '',
      },
    ],
  };
  try {
    convertedResponse.Id = containerResponse.id;
    convertedResponse.Config = {};
    convertedResponse.Config.Env = Object.entries(containerResponse.env).map(([envKey, envValue]) => `${envKey}=${envValue}`);
  }
  catch (error) {
    saveLog(
      nodeId,
      LOG_TYPE.INFO,
      SERVER_TYPE.ANAX_FACING,
      'Error occured while converting mdeploy response to docker response',
      { containerResponse, convertedResponse, error },
      correlationId,
    );
  }
  return convertedResponse;
};

module.exports = {
  converContainerResponse,
};
