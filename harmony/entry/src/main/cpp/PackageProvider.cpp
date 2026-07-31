#include "RNOH/PackageProvider.h"
#include "RNOHPackagesFactory.h"
#include "generated/RNOHGeneratedPackage.h"
#include "expoHarmony/ExpoHarmonyPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(
    Package::Context ctx) {
  auto packages = createRNOHPackages(ctx);
  packages.push_back(std::make_shared<RNOHGeneratedPackage>(ctx));
  packages.push_back(std::make_shared<ExpoHarmonyPackage>(ctx));
  return packages;
}
