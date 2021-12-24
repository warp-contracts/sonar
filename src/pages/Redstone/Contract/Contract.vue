<template>
    <div class="providers-wrapper">
        <div class="d-flex pl-3">
            <div class="flaticon-file-signature m-0-auto"></div>
            <div class="align-self-end contract-header">Contract</div>
            <div class="align-self-end contract-id">{{ contractId }}</div>
            <div
                class="flaticon-copy-to-clipboard"
                v-clipboard="contractId"
                title="Copy to clipboard"
            ></div>
        </div>
        <div class="contract-details-wrapper">
            <div class="cell">
                <div class="cell-header">Owner</div>
                <div class="d-flex">
                    <div>{{ owner }}</div>
                    <div
                        class="flaticon-copy-to-clipboard"
                        v-clipboard="contractId"
                        title="Copy to clipboard"
                    ></div>
                </div>
            </div>
            <div class="cell">
                <div class="cell-header">Total interactions</div>
                <div>{{ total }}</div>
            </div>
        </div>
        <div class="provider-tabs">
            <b-tabs @input="onInput">
                <b-tab title="Transactions">
                    <div v-if="visitedTabs.includes(0)">
                        <TxList :paging="pages" @page-clicked="onPageClicked">
                            <b-table
                                ref="table"
                                id="interactions-table"
                                stacked="md"
                                hover
                                :sort-by="'id'"
                                :items="interactions"
                                :fields="fields"
                                @row-clicked="rowClicked"
                                :busy="!interactionsLoaded"
                            >
                                <template #table-busy> </template>

                                <template #cell(transaction_id)="data">
                                    {{ data.item.interactionId | tx }}
                                </template>

                                <template #cell(block_id)="data">
                                    <a
                                        :href="
                                            `https://viewblock.io/arweave/block/${data.item.blockId}`
                                        "
                                        target="_blank"
                                    >
                                        {{ data.item.blockId | tx }}
                                    </a>
                                </template>

                                <template #cell(block_height)="data">
                                    {{ data.item.blockHeight }}
                                </template>

                                <template #cell(owner)="data">
                                    {{ data.item.owner | tx }}
                                </template>

                                <template #cell(function)="data">
                                    {{ data.item.function }}
                                </template>

                                <template #cell(status)="data">
                                    {{ data.item.status }}
                                </template>

                                <template #cell(confirmingPeers)="data">
                                    {{ data.item.confirmingPeers }}
                                </template>

                                <template #cell(actions)="data">
                                    <i
                                        v-if="!data.item._showDetails"
                                        class="fa fa-chevron-down"
                                    />
                                    <i v-else class="fa fa-chevron-up" />
                                </template>

                                <template slot="row-details" slot-scope="data">
                                    <div>
                                        <json-viewer
                                            :value="data.item.tags"
                                            :expand-depth="1"
                                            copyable
                                            sort
                                        ></json-viewer>
                                        <json-viewer
                                            :value="data.item.interaction"
                                            :expand-depth="1"
                                            copyable
                                            sort
                                        ></json-viewer>
                                    </div>
                                </template>
                            </b-table>
                            <div v-if="!interactionsLoaded">
                                <div
                                    v-for="n in 15"
                                    :key="n"
                                    class="preloader text-preloader manifest-preloader"
                                ></div>
                            </div>
                        </TxList>
                    </div>
                </b-tab>
                <b-tab title="Code">
                    <div v-if="visitedTabs.includes(1)">
                        <CodeSandbox :contractId="contractId"></CodeSandbox>
                    </div>
                </b-tab>
            </b-tabs>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import { TagsParser } from 'redstone-smartweave';
import JsonViewer from 'vue-json-viewer';
import Arweave from 'arweave';
import CodeSandbox from './CodeSandbox/CodeSandbox';

export default {
    name: 'Contract',

    data() {
        return {
            visitedTabs: [],
            info: null,
            fields: [
                'transaction_id',
                'block_id',
                'block_height',
                'owner',
                'function',
                'status',
                'confirmingPeers',
                { key: 'actions', label: '' },
            ],
            interactions: null,
            currentPage: 1,
            paging: null,
            owner: '',
            arweave: null,
            contractTx: '',
            total: 0,
            limit: 15,
        };
    },

    mounted() {
        this.arweave = Arweave.init({
            host: 'arweave.net',
            protocol: 'https',
            port: 443,
        });
        this.getInteractions(this.currentPage);
        this.getContractTx();
    },

    created() {},

    components: { CodeSandbox, TxList, JsonViewer },
    computed: {
        contractId() {
            return this.$route.params.id;
        },
        pages() {
            return this.paging ? this.paging : null;
        },
        interactionsLoaded() {
            return (
                this.interactions &&
                this.total &&
                this.interactions.length ==
                    (this.total > this.limit ? this.limit : this.total)
            );
        },
    },

    methods: {
        onInput(value) {
            if (!this.visitedTabs.includes(value)) {
                this.visitedTabs.push(value);
            }
        },
        rowClicked(record) {
            this.$set(record, '_showDetails', !record._showDetails);
        },
        async getContractTx() {
            this.contractTx = await this.arweave.transactions.get(
                this.contractId
            );
            this.owner = await this.arweave.wallets.ownerToAddress(
                this.contractTx.owner
            );
        },
        async onPageClicked(pageNumber) {
            this.currentPage = pageNumber;
            this.getContracts(this.currentPage);
        },
        async getInteractions(page) {
            this.interactions = [];
            axios
                .get(
                    `https://gateway.redstone.finance/gateway/interactions?contractId=${this.contractId}&limit=${this.limit}&page=${page}`
                )

                .then(async (fetchedInteractions) => {
                    this.paging = fetchedInteractions.data.paging;
                    this.total = fetchedInteractions.data.paging.total;
                    const tagsParser = new TagsParser();

                    fetchedInteractions.data.interactions.forEach((i) => {
                        const obj = {
                            cursor: '',
                            node: i.interaction,
                        };
                        let inputFunc = JSON.parse(
                            tagsParser.getInputTag(obj, this.contractId).value
                        ).function;
                        this.interactions.push({
                            id: i.interaction.id,
                            interactionId: i.interaction.id,
                            blockId: i.interaction.block.id,
                            blockHeight: i.interaction.block.height,
                            function: inputFunc ? inputFunc : '-',
                            status: i.status,
                            owner: i.interaction.owner.address,
                            confirmingPeers: i.confirming_peers,
                            interaction: i.interaction,
                            tags: tagsParser.getInputTag(obj, this.contractId),
                        });
                    });
                });
        },
        styleCategory(text, numberOfCategories, index) {
            return (
                _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '')
            );
        },
    },
};
</script>

<style src="./Contract.scss" lang="scss" scoped></style>
<style lang="scss">
.provider-tabs > .tabs > div:first-of-type {
    height: 44px;
}

.provider-tabs {
    .nav-tabs > .nav-item {
        flex: 0 0 124px;
    }
}

.jv-container {
    .jv-code {
        > .jv-node {
            max-width: 90%;
        }
    }
}
</style>
