var infraFlavorList = getJsonFromFile("infraFlavors.json");
var infraFlavorListPrepared = prepareFlavorsList(JSON.parse(infraFlavorList));
var storagePoliciesList = getJsonFromFile("volumeTypes.json");
var storagePoliciesListPrepared = prepareStoragePoliciesList(JSON.parse(storagePoliciesList));
var userFlavorList = getJsonFromFile("userFlavors.json");
var userFlavorListPrepared = prepareFlavorsList(JSON.parse(userFlavorList));
var imagesList = getJsonFromFile("images.json");
var imageListPrepared = prepareImageList(JSON.parse(imagesList));
var subnetsList = getJsonFromFile("subnets.json");
var subnetListPrepared = prepareSubnetList(JSON.parse(subnetsList));
var sshKeys = getSSHKeysList();
var sshKeysPrepared = prepareSSHKeysList(JSON.parse(sshKeys));
var vapStackName = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: 'source .vapenv && echo $VAP_STACK_NAME'
}]), true).responses[0].out;
var currentSSHKey = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: 'source .vapenv && echo $VAP_SSH_KEY_NAME'
}]), true).responses[0].out;

function getJsonFromFile(jsonFile) {
    var cmd = "cat /var/www/webroot/" + jsonFile;
    var resp = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) return resp;
    return resp.responses[0].out;
}

function getSSHKeysList() {
    var cmd = "source .vapenv; /opt/jelastic-python311/bin/openstack keypair list -f json"
    var resp = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) return resp;
    return resp.responses[0].out;
}

function prepareSSHKeysList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].Name
        });
    }
    return aResultValues;
}

function prepareFlavorsList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].RAM + " Mb " + values[i].VCPUs + " VCPUs ",
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareSubnetList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Subnet,
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareStoragePoliciesList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareImageList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].id
        });
    }
    return aResultValues;
}

var settings = jps.settings.create;
var fields = {};
for (var i = 0, field; field = jps.settings.create.fields[i]; i++)
fields[field.name] = field;
fields["ssh_key"].values = sshKeysPrepared;
fields["ssh_key"].default = currentSSHKey;

settings.fields.push({
    "caption": "Installation type",
    "type": "list",
    "name": "inst_type",
    "default": "poc",
    "tooltip": {
        "text": "Platform types based on the purpose:\n<ul>\n  <li><b>&#x2022; PoC</b> (Proof-of-Concept) - a platform used for feature demonstration or non-complex testing activities\n  <li><b>&#x2022; Sandbox</b> - non-production platform for testing purposes\n  <li><b>&#x2022; Production</b> - a public or private platform that is used for production purposes\n  <li><b>&#x2022; High-Performance Production</b> - the public cloud platform with extended performance capabilities for demanding end-users\n</ul>  \n",
        "maxWidth": 750,
        "minWidth": 750
    },
    "values": {
        "poc": "PoC",
        "sb": "Sandbox",
        "prod": "Production",
        "high_prod": "High Performance Production"
    },
    "showIf": {
        "poc": [{
            "type": "compositefield",
            "caption": "RAM&CPU Infra",
            "defaultMargins": "0 10 0 0",
            "tooltip": {
                "text": "<h2>PoC Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/poc-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            },
            "items": [{
                "name": "infra_cpu_ram",
                "type": "list",
                "required": true,
                "width": 122,
                "values": "infraFlavorListPrepared"
            }, {
                "type": "displayfield",
                "markup": "RAM&CPU User"
            }, {
                "type": "tooltip",
                "text": "<h2>PoC Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/poc-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            }, {
                "name": "user_cpu_ram",
                "type": "list",
                "width": 122,
                "required": true,
                "values": "userFlavorListPrepared"
            }]
        }],
        "sb": [{
            "type": "compositefield",
            "caption": "RAM&CPU Infra",
            "defaultMargins": "0 10 0 0",
            "tooltip": {
                "text": "<h2>Sandbox Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/sandbox-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            },
            "items": [{
                "name": "infra_cpu_ram",
                "type": "list",
                "required": true,
                "width": 122,
                "values": "infraFlavorListPrepared"
            }, {
                "type": "displayfield",
                "markup": "RAM&CPU User"
            }, {
                "type": "tooltip",
                "text": "<h2>Sandbox Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/sandbox-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            }, {
                "name": "user_cpu_ram",
                "type": "list",
                "width": 122,
                "required": true,
                "values": "userFlavorListPrepared"
            }]
        }],
        "prod": [{
            "type": "compositefield",
            "caption": "RAM&CPU Infra",
            "defaultMargins": "0 10 0 0",
            "tooltip": {
                "text": " <h2>Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/performance-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            },
            "items": [{
                "name": "infra_cpu_ram",
                "type": "list",
                "required": true,
                "width": 122,
                "values": "infraFlavorListPrepared"
            }, {
                "type": "displayfield",
                "markup": "RAM&CPU User"
            }, {
                "type": "tooltip",
                "text": " <h2>Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/performance-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            }, {
                "name": "user_cpu_ram",
                "type": "list",
                "width": 122,
                "required": true,
                "values": "userFlavorListPrepared"
            }]
        }],
        "high_prod": [{
            "type": "compositefield",
            "caption": "RAM&CPU Infra",
            "defaultMargins": "0 10 0 0",
            "tooltip": {
                "text": "<h2>High Performance Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/high-performance-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            },
            "items": [{
                "name": "infra_cpu_ram",
                "type": "list",
                "required": true,
                "width": 122,
                "values": "infraFlavorListPrepared"
            }, {
                "type": "displayfield",
                "markup": "RAM&CPU User"
            }, {
                "type": "tooltip",
                "text": "<h2>High Performance Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='https://raw.githubusercontent.com/virtuozzo/vap-installer-on-vhi/master/images/high-performance-requirements.svg'>",
                "tipParams": null,
                "maxWidth": 830,
                "minWidth": 300
            }, {
                "name": "user_cpu_ram",
                "type": "list",
                "width": 122,
                "required": true,
                "values": "userFlavorListPrepared"
            }]
        }]
    }
});

settings.fields.push({
    "caption": "VAP Project Name",
    "type": "string",
    "tooltip": {
        "text": "VAP Project Name",
        "minWidth": 130
    },
    "name": "vap_stack_name",
    "required": true,
    "value": "vapStackName"
});
            
settings.fields.push({
    "type": "compositefield",
    "caption": "Infra Storage,GB",
    "defaultMargins": "0 12 0 0",
    "tooltip": {
        "text": "Storage size for '<b>/</b>', '<b>/vz</b>' and '<b>swap</b>' partition for Infra nodes.<br>\nSwap size depends on RAM:\n<ul>\n  <li><b>&#x2022;</b> 4-8 GB - the swap size is equal to the RAM size\n  <li><b>&#x2022;</b> 8-64 GB - the swap size is half the RAM size\n  <li><b>&#x2022;</b> 64+ GB - the swap size is 32 GB\n</ul>\n",
        "minWidth": 370
    },
    "items": [{
        "type": "spinner",
        "name": "infra_os_storage_size",
        "min": 100,
        "max": 2000,
        "width": 109
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "spinner",
        "name": "infra_vz_storage_size",
        "min": 100,
        "max": 5000,
        "default": 800,
        "width": 108
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "spinner",
        "name": "infra_swap_storage_size",
        "min": 4,
        "max": 512,
        "default": 32,
        "width": 109
    }]
});          
                      
settings.fields.push({
    "type": "compositefield",
    "caption": "User Storage, GB",
    "defaultMargins": "0 12 0 0",
    "tooltip": {
        "text": "Storage size for '<b>/</b>', '<b>/vz</b>' and '<b>swap</b>' partition for User nodes.<br>\nSwap size depends on RAM:\n<ul>\n  <li><b>&#x2022;</b> 4-8 GB - the swap size is equal to the RAM size\n  <li><b>&#x2022;</b> 8-64 GB - the swap size is half the RAM size\n  <li><b>&#x2022;</b> 64+ GB - the swap size is 32 GB\n</ul>\n",
        "minWidth": 370
    },
    "items": [{
        "type": "spinner",
        "name": "user_os_storage_size",
        "min": 100,
        "max": 2000,
        "width": 109
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "spinner",
        "name": "user_vz_storage_size",
        "min": 100,
        "max": 5000,
        "default": 800,
        "width": 108
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "spinner",
        "name": "user_swap_storage_size",
        "min": 4,
        "max": 512,
        "default": 32,
        "width": 109
    }]
});

settings.fields.push({
    "type": "compositefield",
    "caption": "Storage Policies",
    "defaultMargins": "0 12 0 0",
    "tooltip": {
        "text": "Storage policies for '<b>root</b>', '<b>infra</b>' and '<b>user</b>' nodes.<br>\n",
        "minWidth": 370
    },
    "items": [{
        "type": "list",
        "name": "root_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 109
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "list",
        "name": "infra_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 108
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "list",
        "name": "user_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 109
    }]
});

settings.fields.push({
    "caption": "User Node Count",
    "type": "spinner",
    "tooltip": {
        "text": "User Node Count to be created on the IaaS where the Infra nodes are.",
        "minWidth": 135
    },
    "name": "user_node_count",
    "width": 109,
    "default": 1,
    "min": 0,
    "max": 5
});

settings.fields.push({
    "caption": "VHI Public Subnet",
    "type": "list",
    "tooltip": {
        "text": "Select required VHI cluster subnet",
        "minWidth": 240
    },
    "name": "subnet",
    "required": true,
    "values": "subnetListPrepared"
});

settings.fields.push({
    "caption": "VAP Image Name",
    "type": "list",
    "tooltip": {
        "text": "Select required <b>qcow2</b> VAP image name",
        "minWidth": 270
    },
    "name": "image_name",
    "required": true,
    "values": "imageListPrepared"
});

return settings;
