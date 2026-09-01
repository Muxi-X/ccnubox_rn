#include "RNOH/PackageProvider.h"
#include "RNOHPackagesFactory.h"
#include "generated/RNOHGeneratedPackage.h"
#include "expoHarmony/ExpoHarmonyPackage.h"
#include "SkiaPackage.h"
#include "JPushModulePackage.h"
#include "BlobUtilPackage.h"
#include "InappbrowserRebornPackage.h"
#include "LinearGradientPackage.h"
#include "PdfViewPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(
    Package::Context ctx) {
  auto packages = createRNOHPackages(ctx);
  packages.push_back(std::make_shared<RNOHGeneratedPackage>(ctx));
  packages.push_back(std::make_shared<SkiaPackage>(ctx));
  packages.push_back(std::make_shared<JPushModulePackage>(ctx));
  packages.push_back(std::make_shared<BlobUtilPackage>(ctx));
  packages.push_back(std::make_shared<InappbrowserRebornPackage>(ctx));
  packages.push_back(std::make_shared<LinearGradientPackage>(ctx));
  packages.push_back(std::make_shared<PdfViewPackage>(ctx));
  packages.push_back(std::make_shared<ExpoHarmonyPackage>(ctx));
  return packages;
}
